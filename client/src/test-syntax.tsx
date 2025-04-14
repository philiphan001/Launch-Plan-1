import React, { useEffect } from 'react';

const TestComponent = () => {
  // Test syntax
  useEffect(() => {
    console.log("Test effect");
  }, []);
  
  return <div>Test Component</div>;
};

export default TestComponent;