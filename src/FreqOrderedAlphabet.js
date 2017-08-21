import React from 'react';
import PropTypes from 'prop-types';

import './FreqOrderedAlphabet.css';

const FreqOrderedAlphabet = props => {
  const { currentLetter, letters } = props;
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        fontFamily: 'monospace',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {letters.map((letter, i) => {
        let width = '11.1111111111%';
        if (i > 8 && i <= 16) {
          width = '12.5%';
        }
        return (
          <div
            className={letter === currentLetter ? 'current' : null}
            key={letter}
            style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              padding: '0.75rem',
              textAlign: 'center',
              width,
            }}
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
};

FreqOrderedAlphabet.propTypes = {
  currentLetter: PropTypes.string,
  letters: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default FreqOrderedAlphabet;
