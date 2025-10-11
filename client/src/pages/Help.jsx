import FAQ from '../components/common/FAQ';
import QnA from '../components/common/QnA';

export default function Help() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Marketplace Help & FAQs</h2>
      <FAQ QnA={QnA} />
    </div>
  );
}