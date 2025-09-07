import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const ChatInterfaceCheck = () => {
  const [results, setResults] = useState(null);

  const checkInterface = () => {
    console.log('=== Chat Interface Detection ===');
    
    // Check if we're in Electron environment
    const isElectron = navigator.userAgent.includes('Electron');
    console.log('Running in Electron:', isElectron);
    
    // Check if we're using the React component or HTML page
    const isReactComponent = typeof window !== 'undefined' && window.location.protocol === 'http:';
    const isHtmlPage = typeof window !== 'undefined' && window.location.protocol === 'file:';
    
    console.log('Using React Component:', isReactComponent);
    console.log('Using HTML Page:', isHtmlPage);
    
    // Check the current URL
    console.log('Current URL:', window.location.href);
    
    // Check for React-specific elements
    const hasReactElements = document.querySelector('[data-reactroot]') || document.querySelector('[data-reactid]');
    console.log('Has React elements:', !!hasReactElements);
    
    // Check for HTML test page specific elements
    const isTestPage = document.title.includes('Test') || document.body.textContent.includes('Standalone HTML Page');
    console.log('Is Test Page:', isTestPage);
    
    // Check for React component specific elements
    const isReactPage = document.body.textContent.includes('React Component') || document.body.textContent.includes('Correct for Electron');
    console.log('Is React Page:', isReactPage);
    
    console.log('=== Summary ===');
    let resultMessage = '';
    let resultType = 'info';
    
    if (isElectron && isReactPage) {
      console.log('✅ You are using the CORRECT React GroupChat component in the Electron app');
      resultMessage = 'You are using the CORRECT React GroupChat component in the Electron app';
      resultType = 'success';
    } else if (isTestPage) {
      console.log('⚠️ You are using the standalone HTML test page - this is NOT the correct interface for the Electron app');
      resultMessage = 'You are using the standalone HTML test page - this is NOT the correct interface for the Electron app';
      resultType = 'warning';
    } else {
      console.log('❓ Unable to determine which interface you are using');
      resultMessage = 'Unable to determine which interface you are using';
      resultType = 'info';
    }
    
    // Additional debugging for WebSocket connections
    console.log('=== WebSocket Debug Info ===');
    console.log('Window location:', window.location.toString());
    console.log('Origin:', window.location.origin);
    
    setResults({
      isElectron,
      isReactComponent,
      isHtmlPage,
      currentUrl: window.location.href,
      hasReactElements: !!hasReactElements,
      isTestPage,
      isReactPage,
      resultMessage,
      resultType
    });
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center"
      >
        <div className="text-center max-w-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-6"
          >
            <Info className="w-16 h-16 mx-auto text-akash-400" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-foreground mb-4"
          >
            Chat Interface Checker
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-foreground/70 text-lg mb-6"
          >
            This tool helps you determine which chat interface you&apos;re currently using in the Electron app.
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={checkInterface}
            className="px-6 py-3 btn-primary mb-8"
          >
            Check Current Interface
          </motion.button>
          
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div className={`p-4 rounded-lg mb-6 ${
                results.resultType === 'success' ? 'bg-green-500/20 border border-green-500/30' :
                results.resultType === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                'bg-blue-500/20 border border-blue-500/30'
              }`}>
                <div className="flex items-center mb-2">
                  {results.resultType === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  ) : results.resultType === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-400 mr-2" />
                  )}
                  <h3 className="font-semibold text-foreground">
                    {results.resultType === 'success' ? 'Correct Interface' :
                     results.resultType === 'warning' ? 'Incorrect Interface' :
                     'Detection Result'}
                  </h3>
                </div>
                <p className="text-foreground/80">{results.resultMessage}</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4 text-left">
                <h3 className="font-semibold text-foreground mb-3">Debug Information:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Running in Electron:</span>
                    <span className="text-foreground">{results.isElectron ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Current URL:</span>
                    <span className="text-foreground truncate ml-2">{results.currentUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Using React Component:</span>
                    <span className="text-foreground">{results.isReactComponent ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Using HTML Test Page:</span>
                    <span className="text-foreground">{results.isHtmlPage ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Is Test Page:</span>
                    <span className="text-foreground">{results.isTestPage ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Is React Page:</span>
                    <span className="text-foreground">{results.isReactPage ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-foreground/5 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">How to Use:</h3>
                <ol className="list-decimal list-inside text-foreground/80 text-left space-y-1">
                  <li>Open the chat feature in your Electron app</li>
                  <li>Click the &quot;Check Current Interface&quot; button above</li>
                  <li>Review the results to confirm you&apos;re using the correct interface</li>
                </ol>
              </div>
              
              <div className="mt-6 p-4 bg-foreground/5 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Expected Results:</h3>
                <div className="space-y-2 text-left">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-foreground/80">
                      <span className="font-medium">Correct Interface (Electron App):</span> Should show &quot;You are using the CORRECT React GroupChat component in the Electron app&quot;
                    </p>
                  </div>
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-foreground/80">
                      <span className="font-medium">Incorrect Interface (Test Page):</span> Should show &quot;You are using the standalone HTML test page&quot;
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <a 
              href="/chat-interface-check.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-akash-400 hover:text-akash-300 underline"
            >
              Open Standalone Checker <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatInterfaceCheck;