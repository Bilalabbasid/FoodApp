// Import validation test
import { toast } from 'sonner';

// Test that sonner is working
console.log('✅ Sonner import successful');

// Test that toast function exists
if (typeof toast === 'function') {
  console.log('✅ Toast function is available');
} else {
  console.error('❌ Toast function not found');
}

export default function ImportTest() {
  return (
    <div style={{ padding: '20px', border: '1px solid green', margin: '10px' }}>
      <h3>Import Test Component</h3>
      <p>If you can see this, all imports are working correctly.</p>
      <button 
        onClick={() => toast.success('Test notification working!')}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Toast
      </button>
    </div>
  );
}
