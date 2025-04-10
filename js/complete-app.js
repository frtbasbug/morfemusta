// Main application file for MorfemUsta with complete game functionality
// Integrates the super enhanced database, game mechanics, and game interface

import SuperEnhancedMorphemeDatabase from './core/super-enhanced-database.js';
import EnhancedGameMechanics from './core/updated-game-mechanics.js';
import GameInterface from './game-interface.js';

// Main application class
class MorfemUstaApp {
  constructor() {
    this.database = new SuperEnhancedMorphemeDatabase();
    this.gameMechanics = new EnhancedGameMechanics();
    this.gameInterface = null;
    this.currentScreen = 'welcome'; // welcome, age-select, difficulty-select, mode-select, game, results
    
    // Initialize the application
    this.init();
  }
  
  // Initialize the application
  init() {
    console.log('Initializing MorfemUsta application');
    
    // Initialize game interface
    this.gameInterface = new GameInterface();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Show welcome screen
    this.showScreen('welcome');
    
    console.log('MorfemUsta application initialized');
  }
  
  // Set up event listeners
  setupEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      // Navigation menu
      const navLinks = document.querySelectorAll('nav a');
      
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Remove active class from all links
          navLinks.forEach(l => l.classList.remove('active'));
          
          // Add active class to clicked link
          link.classList.add('active');
          
          // Handle navigation based on link ID
          if (link.id === 'nav-home') {
            this.showSection('intro-section');
          } else if (link.id === 'nav-how-to-play') {
            this.showSection('how-to-play-section');
          } else if (link.id === 'nav-about') {
            this.showSection('about-section');
          }
        });
      });
      
      // Start game button
      const startGameBtn = document.getElementById('start-game');
      if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
          console.log('Start game button clicked');
          this.showSection('age-selection-section');
        });
      }
      
      // How to play button
      const howToPlayBtn = document.getElementById('how-to-play-btn');
      if (howToPlayBtn) {
        howToPlayBtn.addEventListener('click', () => {
          console.log('How to play button clicked');
          this.showSection('how-to-play-section');
        });
      }
      
      // Back buttons
      const backFromHowToPlayBtn = document.getElementById('back-from-how-to-play');
      const backFromAboutBtn = document.getElementById('back-from-about');
      
      if (backFromHowToPlayBtn) {
        backFromHowToPlayBtn.addEventListener('click', () => {
          console.log('Back from how to play button clicked');
          this.showSection('intro-section');
        });
      }
      
      if (backFromAboutBtn) {
        backFromAboutBtn.addEventListener('click', () => {
          console.log('Back from about button clicked');
          this.showSection('intro-section');
        });
      }
    });
  }
  
  // Show screen
  showScreen(screen) {
    this.currentScreen = screen;
    
    // Update UI based on current screen
    switch (screen) {
      case 'welcome':
        this.showSection('intro-section');
        break;
      case 'age-select':
        this.showSection('age-selection-section');
        break;
      case 'game':
        this.showSection('game-play-section');
        break;
      case 'results':
        this.showSection('results-section');
        break;
      default:
        this.showSection('intro-section');
    }
  }
  
  // Show section and hide others
  showSection(sectionId) {
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
      section.style.display = section.id === sectionId ? 'block' : 'none';
    });
  }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded - Initializing MorfemUsta application');
  
  // Create global app instance
  window.app = new MorfemUstaApp();
  
  // Set current year in footer
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
  
  console.log('MorfemUsta application initialized successfully');
});

// Export the MorfemUstaApp class
export default MorfemUstaApp;
