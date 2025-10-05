# Contributing to SecondMarket

Thank you for your interest in contributing to SecondMarket! 🎉 We're excited to have you join our community of developers building the next-generation B2B marketplace for Electronics & Electrical products.

## 🎃 Hacktoberfest 2024

We're participating in Hacktoberfest! Look for issues labeled `hacktoberfest` and `good first issue` to get started. All meaningful contributions are welcome!

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Git

### Setup Instructions

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SecondMarket-main.git
   cd SecondMarket-main
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   cp .env.sample .env
   # Configure your MongoDB URI and other environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   npm run dev
   ```

4. **Verify Setup**
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173

## 🤝 How to Contribute

### 1. Find an Issue
- Browse [open issues](https://github.com/YOUR_USERNAME/SecondMarket-main/issues)
- Look for `good first issue` or `help wanted` labels
- Comment on the issue to get assigned

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number
```

### 3. Make Your Changes
- Follow our coding standards (see below)
- Write clear, descriptive commit messages
- Test your changes thoroughly

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add supplier verification badges"
# or
git commit -m "fix: resolve RFQ search pagination issue"
```

### 5. Push and Create PR
```bash
git push origin your-branch-name
```
Then create a Pull Request with a clear description.

## 📝 Coding Standards

### JavaScript/React
- Use ES6+ features
- Follow functional components with hooks
- Use descriptive variable names
- Add JSDoc comments for complex functions
- Use Material-UI components consistently

### Node.js/Express
- Use async/await for asynchronous operations
- Implement proper error handling
- Add input validation for API endpoints
- Follow RESTful API conventions

### Database
- Use meaningful collection and field names
- Add appropriate indexes for performance
- Validate data schemas

## 🎯 Types of Contributions We Welcome

### 🟢 Good First Issues
- Documentation improvements
- UI/UX enhancements
- Adding new Material-UI components
- Writing unit tests
- Bug fixes in forms or validation

### 🟡 Intermediate Issues
- API endpoint development
- Database optimization
- Search and filtering features
- File upload improvements
- Authentication enhancements

### 🔴 Advanced Issues
- Performance optimization
- Security improvements
- Analytics implementation
- Payment integration
- Mobile responsiveness

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm test
```

### Backend Testing
```bash
cd server
npm test
```

### Manual Testing
1. Test user registration and login
2. Create company profiles
3. Post RFQs and submit quotes
4. Verify file uploads work
5. Test search and filtering

## 📋 Pull Request Guidelines

- **Title**: Use clear, descriptive titles
- **Description**: Explain what changes you made and why
- **Screenshots**: Include before/after screenshots for UI changes
- **Testing**: Describe how you tested your changes
- **Documentation**: Update docs if you added new features

### PR Title Format
- `feat: add new feature`
- `fix: resolve bug issue`
- `docs: update documentation`
- `style: improve UI/UX`
- `refactor: restructure code`
- `test: add test cases`

## 🎨 Design Guidelines

- Follow Material-UI design system
- Maintain consistent color scheme (primary: blue, secondary: green)
- Ensure mobile responsiveness
- Use meaningful icons and labels
- Maintain accessibility standards

## 🐛 Reporting Bugs

Before creating a bug report:
1. Check if the issue already exists
2. Test on latest version
3. Provide detailed reproduction steps

Include:
- Operating system and browser
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console errors

## 💡 Suggesting Features

We love new ideas! When suggesting features:
1. Check if it's already been suggested
2. Explain the problem it solves
3. Describe your proposed solution
4. Consider the impact on existing users

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `hacktoberfest` - Hacktoberfest eligible
- `documentation` - Documentation needed
- `frontend` - Client-side issue
- `backend` - Server-side issue
- `database` - Database related

## 🔧 Development Commands

### Backend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Check code style
```

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
npm run lint         # Check code style
```

## 📚 Resources

- [Project Documentation](./docs/)
- [API Reference](./docs/API_REFERENCE.md)
- [Quick Start Guide](./docs/QUICK_START_GUIDE.md)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Express.js Documentation](https://expressjs.com/)

## 🤔 Need Help?

- Check existing [issues](https://github.com/YOUR_USERNAME/SecondMarket-main/issues)
- Join our discussions
- Ask questions in issue comments
- Review our [documentation](./docs/)

## 🎉 Recognition

All contributors will be:
- Added to our contributors list
- Mentioned in release notes
- Given credit in documentation
- Eligible for Hacktoberfest rewards

## 📜 Code of Conduct

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) to understand expected behavior in our community.

---

**Happy Contributing! 🚀**

*Building the future of B2B marketplaces, one contribution at a time.*
