import { MeiliSearch } from 'meilisearch';
import ProductListing from '../models/ProductListing.js';
import User from '../models/User.js';
import analyticsService from './analyticsService.js';

class SearchService {
  constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_URL || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey'
    });
    
    this.listingsIndex = 'listings';
    this.usersIndex = 'users';
    
    this.initializeIndexes();
  }

  /**
   * Initialize search indexes with proper configuration
   */
  async initializeIndexes() {
    try {
      // Create listings index
      await this.client.createIndex(this.listingsIndex, { primaryKey: '_id' });
      
      // Configure searchable attributes for listings
      await this.client.index(this.listingsIndex).updateSearchableAttributes([
        'title',
        'description', 
        'category',
        'subcategory',
        'brand',
        'model',
        'color',
        'condition',
        'location.address',
        'tags'
      ]);

      // Configure filterable attributes
      await this.client.index(this.listingsIndex).updateFilterableAttributes([
        'category',
        'subcategory', 
        'condition',
        'brand',
        'price',
        'featured',
        'promoted',
        'location.coordinates',
        'status',
        'createdAt'
      ]);

      // Configure sortable attributes
      await this.client.index(this.listingsIndex).updateSortableAttributes([
        'price',
        'createdAt',
        'views',
        'featured',
        'promoted',
        'distance'
      ]);

      // Configure ranking rules for relevance
      await this.client.index(this.listingsIndex).updateRankingRules([
        'words',
        'typo',
        'proximity',
        'attribute',
        'featured:desc',
        'promoted:desc',
        'views:desc',
        'sort',
        'exactness'
      ]);

      // Create users index for admin search
      await this.client.createIndex(this.usersIndex, { primaryKey: '_id' });
      
      await this.client.index(this.usersIndex).updateSearchableAttributes([
        'name',
        'email',
        'phoneNumber'
      ]);

      console.log('Search indexes initialized successfully');
    } catch (error) {
      console.error('Search index initialization error:', error);
    }
  }

  /**
   * Search listings with advanced filters and geolocation
   */
  async searchListings(query, filters = {}) {
    try {
      const {
        category,
        subcategory,
        minPrice,
        maxPrice,
        condition,
        brand,
        location,
        radius = 25, // km
        sortBy = 'relevance',
        page = 1,
        limit = 20,
        userId
      } = filters;

      // Build filter string
      let filterArray = ['status = available'];
      
      if (category) {
        filterArray.push(`category = "${category}"`);
      }
      
      if (subcategory) {
        filterArray.push(`subcategory = "${subcategory}"`);
      }
      
      if (condition && condition.length > 0) {
        const conditionFilter = condition.map(c => `"${c}"`).join(' OR ');
        filterArray.push(`condition IN [${conditionFilter}]`);
      }
      
      if (brand) {
        filterArray.push(`brand = "${brand}"`);
      }
      
      if (minPrice !== undefined) {
        filterArray.push(`price >= ${minPrice}`);
      }
      
      if (maxPrice !== undefined) {
        filterArray.push(`price <= ${maxPrice}`);
      }

      // Geolocation filter (if location provided)
      if (location && location.coordinates) {
        const [lng, lat] = location.coordinates;
        filterArray.push(`_geoRadius(${lat}, ${lng}, ${radius * 1000})`); // Convert km to meters
      }

      // Build sort array
      let sort = [];
      switch (sortBy) {
        case 'price_low':
          sort = ['price:asc'];
          break;
        case 'price_high':
          sort = ['price:desc'];
          break;
        case 'newest':
          sort = ['createdAt:desc'];
          break;
        case 'oldest':
          sort = ['createdAt:asc'];
          break;
        case 'featured':
          sort = ['featured:desc', 'promoted:desc', 'views:desc'];
          break;
        default:
          sort = ['featured:desc', 'promoted:desc'];
      }

      const searchParams = {
        q: query || '',
        filter: filterArray.join(' AND '),
        sort: sort,
        limit: limit,
        offset: (page - 1) * limit,
        attributesToHighlight: ['title', 'description'],
        attributesToCrop: ['description'],
        cropLength: 100
      };

      const searchResults = await this.client
        .index(this.listingsIndex)
        .search(query, searchParams);

      // Track search analytics
      if (userId) {
        await analyticsService.trackEvent({
          userId,
          event: 'search_performed',
          properties: {
            query,
            category,
            resultsCount: searchResults.hits.length,
            page,
            filters: filters
          }
        });
      }

      // Calculate distances if location provided
      if (location && location.coordinates) {
        searchResults.hits = searchResults.hits.map(hit => ({
          ...hit,
          distance: this.calculateDistance(
            location.coordinates,
            hit['location.coordinates']
          )
        }));
      }

      return {
        hits: searchResults.hits,
        totalHits: searchResults.estimatedTotalHits,
        page: page,
        totalPages: Math.ceil(searchResults.estimatedTotalHits / limit),
        hasNextPage: page * limit < searchResults.estimatedTotalHits,
        query,
        processingTimeMs: searchResults.processingTimeMs
      };

    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Search service unavailable');
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSearchSuggestions(query, limit = 10) {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      // Search for matching titles and categories
      const results = await this.client
        .index(this.listingsIndex)
        .search(query, {
          limit: limit,
          attributesToRetrieve: ['title', 'category', 'subcategory', 'brand'],
          attributesToHighlight: ['title']
        });

      // Extract unique suggestions
      const suggestions = new Set();
      
      results.hits.forEach(hit => {
        // Add exact title matches
        if (hit.title.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(hit.title);
        }
        
        // Add category suggestions
        if (hit.category.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(hit.category);
        }
        
        // Add brand suggestions
        if (hit.brand && hit.brand.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(hit.brand);
        }
      });

      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }

  /**
   * Get trending searches based on analytics
   */
  async getTrendingSearches(limit = 10) {
    try {
      // Get popular search terms from analytics
      const trendingTerms = await analyticsService.getTrendingSearchTerms(limit);
      return trendingTerms;
    } catch (error) {
      console.error('Trending searches error:', error);
      return [];
    }
  }

  /**
   * Get search facets for filters
   */
  async getSearchFacets(query = '', filters = {}) {
    try {
      const searchResults = await this.client
        .index(this.listingsIndex)
        .search(query, {
          filter: this.buildFilterString(filters),
          facets: ['category', 'subcategory', 'condition', 'brand'],
          limit: 0 // We only want facets, not results
        });

      return {
        categories: searchResults.facetDistribution?.category || {},
        subcategories: searchResults.facetDistribution?.subcategory || {},
        conditions: searchResults.facetDistribution?.condition || {},
        brands: searchResults.facetDistribution?.brand || {}
      };
    } catch (error) {
      console.error('Search facets error:', error);
      return {};
    }
  }

  /**
   * Add or update listing in search index
   */
  async indexListing(listing) {
    try {
      const searchDocument = {
        _id: listing._id.toString(),
        title: listing.title,
        description: listing.description,
        category: listing.category,
        subcategory: listing.subcategory,
        brand: listing.brand,
        model: listing.model,
        color: listing.color,
        condition: listing.condition,
        price: listing.price,
        originalPrice: listing.originalPrice,
        status: listing.status,
        featured: listing.featured || false,
        promoted: listing.promotion ? true : false,
        promotionBoost: listing.promotion?.boost || 0,
        views: listing.views || 0,
        location: {
          address: listing.location?.address,
          coordinates: listing.location?.coordinates
        },
        tags: listing.tags || [],
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt
      };

      // Add geolocation if coordinates exist
      if (listing.location?.coordinates) {
        searchDocument._geo = {
          lat: listing.location.coordinates[1],
          lng: listing.location.coordinates[0]
        };
      }

      await this.client
        .index(this.listingsIndex)
        .addDocuments([searchDocument]);

      console.log(`Listing ${listing._id} indexed successfully`);
    } catch (error) {
      console.error('Listing indexing error:', error);
    }
  }

  /**
   * Remove listing from search index
   */
  async removeListing(listingId) {
    try {
      await this.client
        .index(this.listingsIndex)
        .deleteDocument(listingId.toString());
      
      console.log(`Listing ${listingId} removed from index`);
    } catch (error) {
      console.error('Listing removal error:', error);
    }
  }

  /**
   * Bulk index all listings (for initial setup or reindex)
   */
  async reindexAllListings() {
    try {
      console.log('Starting bulk reindex of all listings...');
      
      let page = 1;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const listings = await ProductListing.find({ status: 'available' })
          .limit(limit)
          .skip((page - 1) * limit)
          .lean();

        if (listings.length === 0) {
          hasMore = false;
          break;
        }

        const documents = listings.map(listing => ({
          _id: listing._id.toString(),
          title: listing.title,
          description: listing.description,
          category: listing.category,
          subcategory: listing.subcategory,
          brand: listing.brand,
          model: listing.model,
          color: listing.color,
          condition: listing.condition,
          price: listing.price,
          originalPrice: listing.originalPrice,
          status: listing.status,
          featured: listing.featured || false,
          promoted: listing.promotion ? true : false,
          promotionBoost: listing.promotion?.boost || 0,
          views: listing.views || 0,
          location: {
            address: listing.location?.address,
            coordinates: listing.location?.coordinates
          },
          tags: listing.tags || [],
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt,
          _geo: listing.location?.coordinates ? {
            lat: listing.location.coordinates[1],
            lng: listing.location.coordinates[0]
          } : undefined
        }));

        await this.client
          .index(this.listingsIndex)
          .addDocuments(documents);

        console.log(`Indexed batch ${page} (${listings.length} listings)`);
        page++;
      }

      console.log('Bulk reindexing completed successfully');
    } catch (error) {
      console.error('Bulk reindexing error:', error);
      throw error;
    }
  }

  /**
   * Search similar listings (for recommendations)
   */
  async findSimilarListings(listingId, limit = 5) {
    try {
      const listing = await ProductListing.findById(listingId);
      if (!listing) {
        return [];
      }

      // Search for similar items based on category, brand, and price range
      const priceRange = listing.price * 0.2; // 20% price variance
      
      const results = await this.client
        .index(this.listingsIndex)
        .search('', {
          filter: [
            `category = "${listing.category}"`,
            `price >= ${listing.price - priceRange}`,
            `price <= ${listing.price + priceRange}`,
            `_id != "${listingId}"`,
            'status = available'
          ].join(' AND '),
          sort: ['promoted:desc', 'featured:desc', 'views:desc'],
          limit: limit
        });

      return results.hits;
    } catch (error) {
      console.error('Similar listings search error:', error);
      return [];
    }
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(timeframe = '7d') {
    try {
      return await analyticsService.getSearchAnalytics(timeframe);
    } catch (error) {
      console.error('Search analytics error:', error);
      return null;
    }
  }

  /**
   * Smart search with spell correction and synonyms
   */
  async smartSearch(query, filters = {}) {
    try {
      // First try exact search
      let results = await this.searchListings(query, filters);
      
      // If no results, try with typo tolerance
      if (results.totalHits === 0 && query) {
        results = await this.client
          .index(this.listingsIndex)
          .search(query, {
            filter: this.buildFilterString(filters),
            typoTolerance: {
              enabled: true,
              minWordSizeForTypos: {
                oneTypo: 4,
                twoTypos: 8
              }
            }
          });
      }

      // If still no results, try category-based search
      if (results.totalHits === 0 && query) {
        const categoryResults = await this.searchByCategory(query, filters);
        if (categoryResults.length > 0) {
          results.hits = categoryResults;
          results.totalHits = categoryResults.length;
        }
      }

      return results;
    } catch (error) {
      console.error('Smart search error:', error);
      return { hits: [], totalHits: 0 };
    }
  }

  /**
   * Search by category when direct search fails
   */
  async searchByCategory(query, filters) {
    const categoryMappings = {
      'phone': 'electronics',
      'mobile': 'electronics', 
      'laptop': 'electronics',
      'computer': 'electronics',
      'car': 'vehicles',
      'bike': 'vehicles',
      'shirt': 'fashion',
      'dress': 'fashion',
      'shoes': 'fashion'
    };

    const matchedCategory = categoryMappings[query.toLowerCase()];
    if (matchedCategory) {
      const results = await this.searchListings('', {
        ...filters,
        category: matchedCategory
      });
      return results.hits;
    }

    return [];
  }

  /**
   * Build filter string from filters object
   */
  buildFilterString(filters) {
    const filterArray = ['status = available'];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          const valueString = value.map(v => `"${v}"`).join(' OR ');
          filterArray.push(`${key} IN [${valueString}]`);
        } else {
          filterArray.push(`${key} = "${value}"`);
        }
      }
    });

    return filterArray.join(' AND ');
  }

  /**
   * Calculate distance between two coordinates
   */
  calculateDistance(coord1, coord2) {
    if (!coord1 || !coord2) return null;
    
    const [lng1, lat1] = coord1;
    const [lng2, lat2] = coord2;
    
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Convert degrees to radians
   */
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Health check for search service
   */
  async healthCheck() {
    try {
      const health = await this.client.health();
      const stats = await this.client.getStats();
      
      return {
        status: 'healthy',
        indexes: stats.indexes,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastUpdate: new Date().toISOString()
      };
    }
  }

  /**
   * Clear all indexes (use with caution)
   */
  async clearIndexes() {
    try {
      await this.client.index(this.listingsIndex).deleteAllDocuments();
      await this.client.index(this.usersIndex).deleteAllDocuments();
      console.log('All search indexes cleared');
    } catch (error) {
      console.error('Clear indexes error:', error);
      throw error;
    }
  }
}

export default new SearchService();
