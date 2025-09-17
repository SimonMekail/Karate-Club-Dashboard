import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import styles from "./SearchBarStyle.module.css";

const SearchBar = ({
  keyWord,
  setKeyWord,
  setCurrentPage,
  placeholder = "Search...",
  searchOptions = [],
  selectedOption,
  setSelectedOption,
}) => {
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  
  useEffect(() => {
    setSpeechSupported(browserSupportsSpeechRecognition);
  }, [browserSupportsSpeechRecognition]);

  
  useEffect(() => {
    if (transcript) {
      
      let cleanedTranscript = transcript.trim();

      
      if (cleanedTranscript.endsWith(".")) {
        cleanedTranscript = cleanedTranscript.slice(0, -1);
      }

      setKeyWord(cleanedTranscript);
      setCurrentPage && setCurrentPage(1);
    }
  }, [transcript, setKeyWord, setCurrentPage]);

  const handleMouseDown = () => {
    if (!speechSupported) return;

    
    holdTimerRef.current = setTimeout(() => {
      setIsHolding(true);
      resetTranscript();
      SpeechRecognition.startListening({
        language: "ar-SA", 
        continuous: true, 
      });
    }, 300);
  };

  const handleMouseUp = () => {
    
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }

    if (isHolding) {
      setIsHolding(false);
      SpeechRecognition.stopListening();
    }
  };

  
  const handleTouchStart = (e) => {
    e.preventDefault();
    handleMouseDown();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleMouseUp();
  };

  
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="container px-0">
      <div className="row justify-content-center mx-0">
        <div className="col-12 p-2 px-lg-4 px-md-3">
          <div className={styles.searchContainer}>
            {searchOptions.length > 1 && (
              <div className={styles.searchFieldSelect}>
                <select
                  className={styles.fieldSelect}
                  aria-label="Search options"
                  value={selectedOption || searchOptions[0]?.value || ""}
                  onChange={(e) => setSelectedOption(e.target.value)}
                >
                  {searchOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className={styles.selectArrow}>▼</span>
              </div>
            )}
            <div className={styles.searchBar}>
              <i className={`fas fa-search ${styles.searchIcon}`}></i>
              <input
                type="search"
                className={styles.searchInput}
                placeholder={placeholder}
                aria-label="Search"
                value={keyWord}
                onChange={(e) => {
                  setKeyWord(e.target.value);
                  setCurrentPage && setCurrentPage(1);
                }}
              />
              {speechSupported && (
                <button
                  type="button"
                  className={`${styles.microphoneButton} ${
                    isHolding ? styles.listening : ""
                  }`}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp} 
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  aria-label={
                    isHolding ? "توقف عن الاستماع" : "اضغط مع الاستمرار للتحدث"
                  }
                >
                  <i
                    className={`fas ${
                      isHolding ? "fa-stop" : "fa-microphone"
                    } ${styles.microphoneIcon}`}
                  ></i>
                  {isHolding && (
                    <span className={styles.listeningAnimation}></span>
                  )}
                </button>
              )}
            </div>
          </div>
          {/* {isHolding && (
            <div className={styles.listeningStatus}>
              جاري الاستماع... تحدث الآن
            </div>
          )} */}
          {!speechSupported && (
            <div className={styles.browserSupportWarning}>
              المتصفح الخاص بك لا يدعم التعرف على الصوت
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
