#!/usr/bin/env node

// Simple integration test for the monitor coupling
const http = require('http');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const ENDPOINTS = [
  '/api/health',
  '/api/system/overview',
  '/api/system/cpu',
  '/api/system/memory',
  '/api/docker/containers'
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint}`;
    
    console.log(`🔍 Testing: ${endpoint}`);
    
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          if (res.statusCode === 200 && json.success) {
            console.log(`✅ ${endpoint}: OK (${res.statusCode}) - ${JSON.stringify({
              success: json.success,
              hasData: !!json.data,
              timestamp: json.timestamp ? 'present' : 'missing'
            })}`);
            resolve({ endpoint, success: true, status: res.statusCode });
          } else {
            console.log(`❌ ${endpoint}: Failed (${res.statusCode}) - ${json.error || 'Unknown error'}`);
            resolve({ endpoint, success: false, status: res.statusCode, error: json.error });
          }
        } catch (parseError) {
          console.log(`❌ ${endpoint}: JSON Parse Error - ${parseError.message}`);
          console.log(`   Raw response: ${data.substring(0, 200)}...`);
          resolve({ endpoint, success: false, status: res.statusCode, error: 'JSON Parse Error' });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${endpoint}: Network Error - ${error.message}`);
      resolve({ endpoint, success: false, error: error.message });
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${endpoint}: Timeout`);
      req.destroy();
      resolve({ endpoint, success: false, error: 'Timeout' });
    });
  });
}

async function runTests() {
  console.log('🧪 Testing Monitor API Integration');
  console.log('=====================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('Note: Make sure the dev server is running (npm run dev)');
  console.log('');
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('');
  console.log('📊 Test Results Summary');
  console.log('=======================');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (results.some(r => !r.success)) {
    console.log('');
    console.log('Failed endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.endpoint}: ${r.error || `HTTP ${r.status}`}`);
    });
  }
  
  console.log('');
  console.log('🔧 Configuration Info:');
  console.log(`   Mode: ${process.env.MONITOR_MODE || 'mock'} (based on .env.local)`);
  console.log(`   Public Mode: ${process.env.NEXT_PUBLIC_MONITOR_MODE || 'mock'}`);
  
  if (process.env.MONITOR_MODE === 'real') {
    console.log(`   Pi URL: ${process.env.MONITOR_API_URL || 'not set'}`);
    console.log(`   Pi Key: ${process.env.MONITOR_API_KEY ? '***' + process.env.MONITOR_API_KEY.slice(-4) : 'not set'}`);
  }
  
  process.exit(successful === total ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});