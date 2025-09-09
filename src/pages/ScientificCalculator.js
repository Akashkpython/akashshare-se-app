import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Divide, Minus, Plus } from 'lucide-react';

const ScientificCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);
  const [isCompact, setIsCompact] = useState(false);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay('0');
  }, []);

  const inputDigit = useCallback((digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDot = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(`${display}.`);
    }
  }, [display, waitingForOperand]);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const performOperation = useCallback((nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let newValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = currentValue / inputValue;
          break;
        case '=':
          newValue = inputValue;
          break;
        default:
          newValue = inputValue;
      }

      setPreviousValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, operation, previousValue]);

  const handleScientificFunction = useCallback((func) => {
    const value = parseFloat(display);
    let result;

    switch (func) {
      // Trigonometric functions
      case 'sin':
        result = Math.sin(value);
        break;
      case 'cos':
        result = Math.cos(value);
        break;
      case 'tan':
        result = Math.tan(value);
        break;
      case 'asin':
        result = Math.asin(value);
        break;
      case 'acos':
        result = Math.acos(value);
        break;
      case 'atan':
        result = Math.atan(value);
        break;
        
      // Hyperbolic functions
      case 'sinh':
        result = Math.sinh(value);
        break;
      case 'cosh':
        result = Math.cosh(value);
        break;
      case 'tanh':
        result = Math.tanh(value);
        break;
        
      // Logarithmic functions
      case 'log':
        result = Math.log10(value);
        break;
      case 'ln':
        result = Math.log(value);
        break;
      case 'log2':
        result = Math.log2(value);
        break;
        
      // Exponential functions
      case 'exp':
        result = Math.exp(value);
        break;
      case 'pow10':
        result = Math.pow(10, value);
        break;
      case 'pow2':
        result = Math.pow(2, value);
        break;
        
      // Root functions
      case 'sqrt':
        result = Math.sqrt(value);
        break;
      case 'cbrt':
        result = Math.cbrt(value);
        break;
        
      // Power functions
      case 'square':
        result = value * value;
        break;
      case 'cube':
        result = value * value * value;
        break;
        
      // Constants
      case 'pi':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
        
      // Other functions
      case 'abs':
        result = Math.abs(value);
        break;
      case 'floor':
        result = Math.floor(value);
        break;
      case 'ceil':
        result = Math.ceil(value);
        break;
      case 'round':
        result = Math.round(value);
        break;
      case 'factorial':
        if (value < 0) {
          result = NaN;
        } else {
          result = 1;
          for (let i = 2; i <= value; i++) {
            result *= i;
          }
        }
        break;
        
      // Memory functions
      case 'mc': // Memory clear
        setMemory(0);
        return;
      case 'mr': // Memory recall
        setDisplay(String(memory));
        return;
      case 'm+': // Memory add
        setMemory(memory + value);
        return;
      case 'm-': // Memory subtract
        setMemory(memory - value);
        return;
      case 'ms': // Memory store
        setMemory(value);
        return;
        
      default:
        result = value;
    }

    setDisplay(String(isNaN(result) ? 'Error' : result));
    setWaitingForOperand(true);
  }, [display, memory]);

  const handleKeyDown = useCallback((event) => {
    let { key } = event;

    if (key === 'Enter') key = '=';
    if (key === 'Escape') key = 'AC';
    if (key === ',') key = '.';

    if (/\d/.test(key)) {
      event.preventDefault();
      inputDigit(parseInt(key, 10));
    } else if (key === '.') {
      event.preventDefault();
      inputDot();
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
      event.preventDefault();
      performOperation(
        key === '*' ? '×' : key === '/' ? '÷' : key
      );
    } else if (key === '=') {
      event.preventDefault();
      performOperation('=');
    } else if (key === 'AC') {
      event.preventDefault();
      clearAll();
    }
  }, [clearAll, inputDigit, inputDot, performOperation]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const CalculatorButton = ({ onClick, className, children, ...props }) => (
    <motion.button
      whileHover={{ scale: isCompact ? 1.02 : 1.05 }}
      whileTap={{ scale: isCompact ? 0.98 : 0.95 }}
      onClick={onClick}
      className={`flex items-center justify-center rounded-xl font-medium transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );

  // Toggle compact mode
  const toggleCompactMode = () => {
    setIsCompact(!isCompact);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{
          background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.9), rgba(139, 92, 246, 0.9))',
          borderColor: 'rgba(75, 85, 99, 0.3)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calculator className="mr-3" size={24} />
            <div>
              <h1 className="text-xl font-bold text-white">Scientific Calculator</h1>
              <p className="text-sm text-blue-100">Advanced mathematical functions</p>
            </div>
          </div>
          <button
            onClick={toggleCompactMode}
            className="px-3 py-1 text-xs text-white transition-colors rounded-full bg-white/20 hover:bg-white/30"
          >
            {isCompact ? 'Expand' : 'Compact'}
          </button>
        </div>
      </div>

      {/* Calculator Area */}
      <div 
        className="flex flex-col flex-1 p-4"
        style={{
          background: 'linear-gradient(180deg, rgba(18, 18, 18, 0.95) 0%, rgba(28, 28, 28, 0.95) 100%)'
        }}
      >
        {/* Display */}
        <div className="mb-4">
          <div 
            className="p-5 text-right shadow-lg rounded-2xl"
            style={{
              background: 'linear-gradient(90deg, rgba(28, 28, 28, 0.9), rgba(45, 45, 45, 0.9))',
              border: '1px solid rgba(75, 85, 99, 0.3)'
            }}
          >
            <div className="h-6 text-sm text-gray-400">
              {previousValue !== null ? `${previousValue} ${operation || ''}` : ''}
            </div>
            <div className="py-2 overflow-x-auto text-3xl font-bold text-white whitespace-nowrap">
              {display.length > 15 ? `${display.slice(0, 15)}...` : display}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>Memory: {memory}</span>
              <span>Mode: {isCompact ? 'Compact' : 'Full'}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Button Area */}
        <div className={`flex-1 overflow-y-auto ${isCompact ? 'pb-20' : ''}`}>
          {/* Memory Functions */}
          <div className="grid grid-cols-5 gap-2 mb-2">
            <CalculatorButton
              onClick={() => handleScientificFunction('mc')}
              className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
            >
              MC
            </CalculatorButton>
            <CalculatorButton
              onClick={() => handleScientificFunction('mr')}
              className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
            >
              MR
            </CalculatorButton>
            <CalculatorButton
              onClick={() => handleScientificFunction('m+')}
              className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
            >
              M+
            </CalculatorButton>
            <CalculatorButton
              onClick={() => handleScientificFunction('m-')}
              className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
            >
              M-
            </CalculatorButton>
            <CalculatorButton
              onClick={() => handleScientificFunction('ms')}
              className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
            >
              MS
            </CalculatorButton>
          </div>

          {!isCompact && (
            <>
              {/* Scientific Functions Row 1 */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                <CalculatorButton
                  onClick={() => handleScientificFunction('sin')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  sin
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('cos')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  cos
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('tan')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  tan
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('asin')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  {`sin`}
                  <sup>-1</sup>
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('acos')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  {`cos`}
                  <sup>-1</sup>
                </CalculatorButton>
              </div>

              {/* Scientific Functions Row 2 */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                <CalculatorButton
                  onClick={() => handleScientificFunction('atan')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  {`tan`}
                  <sup>-1</sup>
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('sinh')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  sinh
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('cosh')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  cosh
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('tanh')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  tanh
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('log')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  log
                </CalculatorButton>
              </div>

              {/* Scientific Functions Row 3 */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                <CalculatorButton
                  onClick={() => handleScientificFunction('ln')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  ln
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('log2')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  {`log`}
                  <sub>2</sub>
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('exp')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  {`e`}
                  <sup>x</sup>
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('pow10')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  10<sup>x</sup>
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('pow2')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  2<sup>x</sup>
                </CalculatorButton>
              </div>

              {/* Scientific Functions Row 4 */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                <CalculatorButton
                  onClick={() => handleScientificFunction('sqrt')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  √
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('cbrt')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  ∛
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('square')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  x²
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('cube')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  x³
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('factorial')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  x!
                </CalculatorButton>
              </div>

              {/* Scientific Functions Row 5 */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                <CalculatorButton
                  onClick={() => handleScientificFunction('abs')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  |x|
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('floor')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  floor
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('ceil')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  ceil
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('round')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  round
                </CalculatorButton>
                <CalculatorButton
                  onClick={() => handleScientificFunction('pi')}
                  className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
                >
                  π
                </CalculatorButton>
              </div>
            </>
          )}

          {/* Constants and Clear Functions */}
          <div className="grid grid-cols-5 gap-2 mb-2">
            {!isCompact && (
              <CalculatorButton
                onClick={() => handleScientificFunction('e')}
                className="h-10 text-purple-300 bg-purple-600/20 hover:bg-purple-600/30"
              >
                e
              </CalculatorButton>
            )}
            <CalculatorButton
              onClick={toggleSign}
              className="h-10 text-gray-300 bg-gray-600/20 hover:bg-gray-600/30"
            >
              ±
            </CalculatorButton>
            <CalculatorButton
              onClick={inputPercent}
              className="h-10 text-gray-300 bg-gray-600/20 hover:bg-gray-600/30"
            >
              %
            </CalculatorButton>
            <CalculatorButton
              onClick={clearEntry}
              className="h-10 text-yellow-300 bg-yellow-600/20 hover:bg-yellow-600/30"
            >
              CE
            </CalculatorButton>
            <CalculatorButton
              onClick={clearAll}
              className="h-10 col-span-2 text-red-300 bg-red-600/20 hover:bg-red-600/30"
            >
              AC
            </CalculatorButton>
          </div>

          {/* Main Calculator */}
          <div className="grid grid-cols-4 gap-2">
            <CalculatorButton
              onClick={() => inputDigit(7)}
              className="text-white bg-gray-700/50 hover:bg-gray-700 h-14"
            >
              7
            </CalculatorButton>
            <CalculatorButton
              onClick={() => inputDigit(8)}
              className="text-white bg-gray-700/50 hover:bg-gray-700 h-14"
            >
              8
            </CalculatorButton>
            <CalculatorButton
              onClick={() => inputDigit(9)}
              className="text-white bg-gray-700/50 hover:bg-gray-700 h-14"
            >
              9
            </CalculatorButton>
            <CalculatorButton
              onClick={() => performOperation('÷')}
              className="text-blue-300 bg-blue-600/20 hover:bg-blue-600/30 h-14"
            >
              <Divide size={20} />
            </CalculatorButton>
            
            <CalculatorButton
              onClick={() => inputDigit(4)}
              className="text-white bg-gray-700/50 hover:bg-gray-700 h-14"
            >
              4
            </CalculatorButton>
            <CalculatorButton
              onClick={() => inputDigit(5)}
              className="text-white bg-gray-700/50 hover:bg-gray-700 h-14"
            >
              5
            </CalculatorButton>
            <CalculatorButton
              onClick={() => inputDigit(6)}
              className="text-white bg-gray-700/50 hover:bg-gray-700 h-14"
            >
              6
            </CalculatorButton>
            <CalculatorButton
              onClick={() => performOperation('-')}
              className="text-blue-300 bg-blue-600/20 hover:bg-blue-600/30 h-14"
            >
              <Minus size={20} />
            </CalculatorButton>
            
            <CalculatorButton
              onClick={() => inputDigit(1)}
              className="text-white bg-gray-700/50 hover:bg-gray-700 h-14"
            >
              1
            </CalculatorButton>
            <CalculatorButton
              onClick={() => inputDigit(2)}
              className="text-white bg-gray-700/50 hover:bg-gray-700 h-14"
            >
              2
            </CalculatorButton>
            <CalculatorButton
              onClick={() => inputDigit(3)}
              className="text-white bg-gray-700/50 hover:bg-gray-700 h-14"
            >
              3
            </CalculatorButton>
            <CalculatorButton
              onClick={() => performOperation('+')}
              className="text-blue-300 bg-blue-600/20 hover:bg-blue-600/30 h-14"
            >
              <Plus size={20} />
            </CalculatorButton>
            
            <CalculatorButton
              onClick={() => inputDigit(0)}
              className="col-span-2 text-white bg-gray-700/50 hover:bg-gray-700 h-14"
            >
              0
            </CalculatorButton>
            <CalculatorButton
              onClick={inputDot}
              className="text-white bg-gray-700/50 hover:bg-gray-700 h-14"
            >
              .
            </CalculatorButton>
            <CalculatorButton
              onClick={() => performOperation('=')}
              className="text-green-300 bg-green-600/20 hover:bg-green-600/30 h-14"
            >
              =
            </CalculatorButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScientificCalculator;