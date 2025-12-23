import * as hmUI from "@zos/ui";
import { onKey, KEY_UP, KEY_DOWN, KEY_SELECT, KEY_EVENT_CLICK } from '@zos/interaction';
import { log as Logger, px } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../utils/config/device";
import { ACTIVE_COLOR, SELECTED_BG_COLOR, DARK_ORANGE } from "../utils/config/constants";
import {
  HEADER_TEXT,
  HEADER_BG,
  LIST_START_Y,
  LIST_ITEM_HEIGHT,
  LIST_ITEM_SPACING,
  LIST_PADDING,
  COLUMN_SPACING,
  PRAYER_NAME_TEXT,
  PRAYER_TIME_TEXT,
  TIME_REMAINING_TEXT,
  ACTIVE_PRAYER_NAME_TEXT,
  ACTIVE_PRAYER_TIME_TEXT,
  ACTIVE_PRAYER_BG,
  INACTIVE_PRAYER_BG,
  CENTER_PRAYER_BG,
  CENTER_MESSAGE_TEXT,
  ERROR_TEXT
} from "zosLoader:./index.[pf].layout.js";

const logger = Logger.getLogger("fetch_api");
let headerWidget;
let qiblaWidget = null; // Track qibla widget separately
let prayerWidgets = [];
let currentRequest = null;
let updateTimer = null;
let rotationOffset = 0; // Track rotation position
let currentPrayerData = null; // Store current prayer data
let isInitialLoad = true; // Track if this is the first render
let isCitySelectionMode = false; // Track if we're in city selection mode
let citySelectionOffset = 0; // Track which city is selected in city list
let currentCityIndex = 0; // Track the currently selected city index

// Supported cities with timezones (must match app-side/index.js)
// Sorted from east to west (highest to lowest UTC offset)
const supportedCities = [
  { name: 'Sydney', timezone: 'AEST' },
  { name: 'Tokyo', timezone: 'JST' },
  { name: 'Kuala Lumpur', timezone: 'MYT' },
  { name: 'Singapore', timezone: 'SGT' },
  { name: 'Jakarta', timezone: 'WIB' },
  { name: 'Dhaka', timezone: 'BDT' },
  { name: 'New Delhi', timezone: 'IST' },
  { name: 'Karachi', timezone: 'PKT' },
  { name: 'Dubai', timezone: 'GST' },
  { name: 'Tehran', timezone: 'IRST' },
  { name: 'Doha', timezone: 'AST' },
  { name: 'Moscow', timezone: 'MSK' },
  { name: 'Makkah', timezone: 'AST' },
  { name: 'Istanbul', timezone: 'TRT' },
  { name: 'Paris', timezone: 'CET' },
  { name: 'London', timezone: 'GMT' },
  { name: 'Toronto', timezone: 'EST' },
  { name: 'New York', timezone: 'EST' },
  { name: 'Austin', timezone: 'CST' },
  { name: 'San Francisco', timezone: 'PST' }
];

// City coordinates for qibla calculation (latitude, longitude)
const cityCoordinates = {
  'Sydney': [-33.8688, 151.2093],
  'Tokyo': [35.6762, 139.6503],
  'Kuala Lumpur': [3.1390, 101.6869],
  'Singapore': [1.3521, 103.8198],
  'Jakarta': [-6.2088, 106.8456],
  'Dhaka': [23.8103, 90.4125],
  'New Delhi': [28.6139, 77.2090],
  'Karachi': [24.8607, 67.0011],
  'Dubai': [25.2048, 55.2708],
  'Tehran': [35.6892, 51.3890],
  'Doha': [25.2854, 51.5310],
  'Moscow': [55.7558, 37.6173],
  'Makkah': [21.4225, 39.8262],
  'Istanbul': [41.0082, 28.9784],
  'Paris': [48.8566, 2.3522],
  'London': [51.5074, -0.1278],
  'Toronto': [43.6532, -79.3832],
  'New York': [40.7128, -74.0060],
  'Austin': [30.2672, -97.7431],
  'San Francisco': [37.7749, -122.4194]
};

// Mecca coordinates (Kaaba)
const MECCA_LAT = 21.4225;
const MECCA_LON = 39.8262;

// Calculate qibla direction (bearing) from a city to Mecca
function calculateQibla(lat, lon) {
  // Convert degrees to radians
  const lat1 = lat * Math.PI / 180;
  const lon1 = lon * Math.PI / 180;
  const lat2 = MECCA_LAT * Math.PI / 180;
  const lon2 = MECCA_LON * Math.PI / 180;
  
  // Calculate bearing using the formula
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x);
  bearing = bearing * 180 / Math.PI;
  bearing = (bearing + 360) % 360; // Normalize to 0-360
  
  return Math.round(bearing);
}

function formatDate(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();
  return `${day} ${month} ${dayNum.toString().padStart(2, '0')} ${year}`;
}

function calculateTimeRemaining(prayerTimeStr, formatAsCounter = false) {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();
  
  // Parse time string (format: "5:37 AM" or "05:37 PM")
  const parts = prayerTimeStr.trim().split(' ');
  const timeOnly = parts[0];
  const period = parts[1] || '';
  const [hours, minutes] = timeOnly.split(':').map(Number);
  
  // Convert to 24-hour format
  let prayerHours = hours % 12;
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    prayerHours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    prayerHours = 0;
  }
  const prayerMinutes = minutes;
  
  // Calculate time difference in seconds
  let diffSeconds = ((prayerHours * 60 + prayerMinutes) * 60) - ((currentHours * 60 + currentMinutes) * 60 + currentSeconds);
  
  // If negative, it's tomorrow
  if (diffSeconds < 0) {
    diffSeconds += 24 * 60 * 60;
  }
  
  if (formatAsCounter) {
    // Format as hh:mm:ss counter
    const hoursRemaining = Math.floor(diffSeconds / 3600);
    const minsRemaining = Math.floor((diffSeconds % 3600) / 60);
    const secsRemaining = diffSeconds % 60;
    return `${hoursRemaining.toString().padStart(2, '0')}:${minsRemaining.toString().padStart(2, '0')}:${secsRemaining.toString().padStart(2, '0')}`;
  } else {
    // Format as before (h m format)
    const hoursRemaining = Math.floor(diffSeconds / 3600);
    const minsRemaining = Math.floor((diffSeconds % 3600) / 60);
    
    if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minsRemaining}m`;
    } else if (minsRemaining > 0) {
      return `${minsRemaining}m`;
    } else {
      return "Now";
    }
  }
}

let locationIconWidget = null;

function deleteAllWidgets() {
  if (headerWidget) {
    hmUI.deleteWidget(headerWidget);
    headerWidget = null;
  }
  if (qiblaWidget) {
    hmUI.deleteWidget(qiblaWidget);
    qiblaWidget = null;
  }
  prayerWidgets.forEach(widget => {
    if (widget) hmUI.deleteWidget(widget);
  });
  prayerWidgets = [];
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
  }
}

Page(
  BasePage({
    state: {},
    build() {
            onKey({
              callback: (key, keyEvent) => {
                if (keyEvent === KEY_EVENT_CLICK) {
                  if (key === KEY_SELECT) {
                    if (isCitySelectionMode) {
                      this.selectCity(); // Select the city
                    } else {
                      this.showCityList(); // Show city list on SELECT
                    }
                  } else if (key === KEY_UP) {
                    if (isCitySelectionMode) {
                      this.navigateCityList(-1); // Navigate up in city list
                    } else {
                      this.rotateList(-1); // Rotate up (previous item)
                    }
                  } else if (key === KEY_DOWN) {
                    if (isCitySelectionMode) {
                      this.navigateCityList(1); // Navigate down in city list
                    } else {
                      this.rotateList(1); // Rotate down (next item)
                    }
                  }
                } else {
                  zepos.defaultOnKey(key, context);
                }
              },
            });

      setTimeout(() => {
        this.fetchData('');
      }, 10);
    },
    showCityList() {
      // Show city selection list - center on currently selected city
      isCitySelectionMode = true;
      citySelectionOffset = currentCityIndex; // Start at currently selected city
      this.renderCityList();
    },
    navigateCityList(direction) {
      // Navigate through city list
      if (isCitySelectionMode) {
        citySelectionOffset += direction;
        // Circular wrapping
        citySelectionOffset = ((citySelectionOffset % supportedCities.length) + supportedCities.length) % supportedCities.length;
        this.renderCityList();
      }
    },
    selectCity() {
      // Select the current city and fetch data
      if (isCitySelectionMode) {
        isCitySelectionMode = false;
        currentCityIndex = citySelectionOffset; // Update current city index
        rotationOffset = 0;
        isInitialLoad = true;
        // Send the city index to app-side
        this.fetchData(`CITY_${citySelectionOffset}`);
      }
    },
    renderCityList() {
      deleteAllWidgets();
      
      // Calculate how many items can fit on screen
      const itemsPerScreen = 3;
      const centerIndex = Math.floor(itemsPerScreen / 2);
      
      // Normalize city selection offset
      citySelectionOffset = ((citySelectionOffset % supportedCities.length) + supportedCities.length) % supportedCities.length;
      
      // Render header
      headerWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...HEADER_TEXT,
        color: DARK_ORANGE, // Dark orange color
        text_style: hmUI.text_style.BOLD,
        text: "Select City",
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
      });
      
      // Render city list
      prayerWidgets = [];
      const padding = LIST_PADDING - px(10);
      const itemPadding = px(30);
      const itemWidth = DEVICE_WIDTH - (padding * 2);
      
      for (let displayIndex = 0; displayIndex < itemsPerScreen; displayIndex++) {
        // Calculate the actual city index with circular wrapping
        // citySelectionOffset is the center item, so we need to adjust
        const actualIndex = (citySelectionOffset + displayIndex - centerIndex + supportedCities.length) % supportedCities.length;
        const isCenter = displayIndex === centerIndex;
        const y = LIST_START_Y + (displayIndex * (LIST_ITEM_HEIGHT + LIST_ITEM_SPACING));
        
        // Determine styles
        let bgStyle;
        let textStyle;
        
        if (isCenter) {
          bgStyle = { color: SELECTED_BG_COLOR, radius: px(8) }; // Dark orange background
          textStyle = {
            ...ACTIVE_PRAYER_NAME_TEXT,
            color: 0x000000, // Black font color for selected city
            text_style: hmUI.text_style.BOLD,
            align_h: hmUI.align.LEFT,
            align_v: hmUI.align.CENTER_V,
          };
        } else {
          bgStyle = { color: 0x00000000 }; // Transparent
          textStyle = {
            ...PRAYER_NAME_TEXT,
            align_h: hmUI.align.LEFT,
            align_v: hmUI.align.CENTER_V,
          };
        }
        
        // Create background
        const bgWidget = hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: 0,
          y: y,
          w: DEVICE_WIDTH,
          h: LIST_ITEM_HEIGHT,
          ...bgStyle,
        });
        prayerWidgets.push(bgWidget);
        
        // City name widget - left aligned, vertically centered
        const cityData = supportedCities[actualIndex];
        // Calculate width to prevent clipping - leave space for qibla on the right
        const qiblaWidth = px(80); // Space for qibla degree value
        const cityNameWidth = DEVICE_WIDTH - (padding * 2) - (itemPadding * 2) - qiblaWidth - px(10); // Leave gap between city and qibla
        const cityWidget = hmUI.createWidget(hmUI.widget.TEXT, {
          ...textStyle,
          x: padding + itemPadding,
          y: y,
          w: cityNameWidth,
          h: LIST_ITEM_HEIGHT,
          text: cityData.name,
          align_v: hmUI.align.CENTER_V, // Vertically center aligned
        });
        prayerWidgets.push(cityWidget);
        
        // Show qibla degree value on the right side, right-aligned, white color, vertically centered
        const coords = cityCoordinates[cityData.name];
        if (coords) {
          const qibla = calculateQibla(coords[0], coords[1]);
          const qiblaWidget = hmUI.createWidget(hmUI.widget.TEXT, {
            ...textStyle,
            x: DEVICE_WIDTH - padding - itemPadding - qiblaWidth,
            y: y,
            w: qiblaWidth,
            h: LIST_ITEM_HEIGHT,
            text: `${qibla}°`,
            color: 0xFFFFFF, // White color
            align_h: hmUI.align.RIGHT,
            align_v: hmUI.align.CENTER_V, // Vertically center aligned
          });
          prayerWidgets.push(qiblaWidget);
        }
      }
    },
    changeLocation() {
      // Legacy function - now handled by city selection
      this.showCityList();
    },
    rotateList(direction) {
      // Rotate the list and re-render
      if (currentPrayerData) {
        rotationOffset += direction;
        this.renderPrayerTimeList(currentPrayerData);
      }
    },
    showLoading() {
      deleteAllWidgets(); // This already deletes qibla widget
      headerWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(0),
        y: DEVICE_HEIGHT / 2 - px(20), // Center vertically
        w: DEVICE_WIDTH,
        h: px(40),
        text: "Loading...",
        color: DARK_ORANGE, // Dark orange color
        text_size: px(36), // Increased font size
        text_style: hmUI.text_style.BOLD, // Bold text
        align_h: hmUI.align.CENTER_H, // Center horizontally
        align_v: hmUI.align.CENTER_V, // Center vertically
      });
    },
    renderPrayerTimeList(data) {
      deleteAllWidgets();
      
      // Store current data for rotation
      currentPrayerData = data;
      
      const { result = [], city } = data;
      const prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const totalItems = result.length;
      
      // Find the next prayer time index
      let nextPrayerIndex = -1;
      for (let i = 0; i < result.length; i++) {
        if (result[i].isUpcoming) {
          nextPrayerIndex = i;
          break;
        }
      }
      
      // Calculate how many items can fit on screen (approximately 3-4 items)
      const itemsPerScreen = 3;
      const centerIndex = Math.floor(itemsPerScreen / 2); // Middle position (index 1 for 3 items)
      
      // Initialize rotation offset to center the next prayer ONLY on first load
      // Don't reset it on timer updates to preserve user's scroll position
      if (isInitialLoad && nextPrayerIndex >= 0) {
        rotationOffset = nextPrayerIndex - centerIndex;
        isInitialLoad = false; // Mark that initial load is done
      }
      
      // Normalize rotation offset to be within valid range (circular)
      rotationOffset = ((rotationOffset % totalItems) + totalItems) % totalItems;
      
      // Render header with city name
      headerWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...HEADER_TEXT,
        color: DARK_ORANGE, // Orange color for location (hex: D44C02)
        text: city,
        text_style: hmUI.text_style.BOLD, // Bold text
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
      });
      
      // Calculate and render qibla direction below city name
      const coords = cityCoordinates[city];
      if (coords) {
        const qibla = calculateQibla(coords[0], coords[1]);
        // Delete existing qibla widget if it exists (to prevent duplicates)
        if (qiblaWidget) {
          hmUI.deleteWidget(qiblaWidget);
          qiblaWidget = null;
        }
        // Create new qibla widget - white color, same size as city name
        qiblaWidget = hmUI.createWidget(hmUI.widget.TEXT, {
          ...HEADER_TEXT,
          x: px(0),
          y: HEADER_TEXT.y + HEADER_TEXT.h - px(10), // Position below city name
          w: DEVICE_WIDTH,
          h: px(30),
          color: 0xFFFFFF, // White color
          text: `Qibla ${qibla}°`,
          text_size: HEADER_TEXT.text_size, // Same font size as city name
          text_style: HEADER_TEXT.text_style, // Same text style as city name
          align_h: hmUI.align.CENTER_H,
          align_v: hmUI.align.TOP,
        });
      }
      
      // Render visible items based on rotation
      prayerWidgets = [];
      const padding = LIST_PADDING - px(10); // Reduced padding to increase item width
      const itemPadding = px(30); // More internal padding
      const itemWidth = DEVICE_WIDTH - (padding * 2);
      
      for (let displayIndex = 0; displayIndex < itemsPerScreen; displayIndex++) {
        // Calculate the actual prayer index with circular wrapping
        const actualIndex = (rotationOffset + displayIndex) % totalItems;
        const isNext = actualIndex === nextPrayerIndex;
        const isCenter = displayIndex === centerIndex; // Check if this is the middle item (index 1)
        const y = LIST_START_Y + (displayIndex * (LIST_ITEM_HEIGHT + LIST_ITEM_SPACING));
        
        // Determine background and font styles:
        // - Middle item (focused) gets active bg and font color
        // - Next prayer (when not in middle) gets accent blue font color
        // - Others get inactive bg and default font color
        let bgStyle;
        let nameTextStyle;
        let timeTextStyle;
        
        if (isCenter) {
          // Middle item (focused) gets dark orange background and black font color
          bgStyle = { color: SELECTED_BG_COLOR, radius: px(8) }; // Dark orange background
          nameTextStyle = {
            ...ACTIVE_PRAYER_NAME_TEXT,
            color: 0x000000, // Black font color
            text_style: hmUI.text_style.BOLD,
          };
          timeTextStyle = {
            ...ACTIVE_PRAYER_TIME_TEXT,
            color: 0x000000, // Black font color
            text_style: hmUI.text_style.BOLD,
          };
        } else if (isNext) {
          // Next prayer (when not in middle) gets dark orange font color, transparent background
          bgStyle = { color: 0x00000000 }; // Transparent background
          nameTextStyle = {
            ...PRAYER_NAME_TEXT,
            color: DARK_ORANGE, // Dark orange for next prayer
          };
          timeTextStyle = {
            ...PRAYER_TIME_TEXT,
            color: DARK_ORANGE, // Dark orange for next prayer
          };
        } else {
          bgStyle = { color: 0x00000000 }; // Transparent background for non-center items
          nameTextStyle = PRAYER_NAME_TEXT;
          timeTextStyle = PRAYER_TIME_TEXT;
        }
        
        // Create background for prayer item - all items extend to screen edges
        // Text stays aligned with padding for all items
        const bgWidget = hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: 0,
          y: y,
          w: DEVICE_WIDTH,
          h: LIST_ITEM_HEIGHT,
          ...bgStyle,
        });
        prayerWidgets.push(bgWidget);
        
        // Prayer name widget (first line, left)
        const nameWidget = hmUI.createWidget(hmUI.widget.TEXT, {
          ...nameTextStyle,
          x: padding + itemPadding,
          y: y + px(14),
          w: px(140),
          h: px(45), // Increased height to show full name properly
          text: prayerNames[actualIndex],
        });
        prayerWidgets.push(nameWidget);
        
        // Prayer time widget (first line, right aligned)
        const timeWidget = hmUI.createWidget(hmUI.widget.TEXT, {
          ...timeTextStyle,
          x: padding + itemPadding + px(140),
          y: y + px(14),
          w: itemWidth - (itemPadding * 2) - px(140),
          h: px(45), // Match prayer name height for proper alignment
          text: result[actualIndex].time,
        });
        prayerWidgets.push(timeWidget);
        
        // Time remaining widget (second line) - show for all prayer times
        // Next prayer shows counter in hh:mm:ss format, others show regular format
        const timeRemaining = calculateTimeRemaining(result[actualIndex].time, isNext);
        const remainingText = isNext ? timeRemaining : timeRemaining; // No "in" prefix for counter format
        
        // Time remaining colors: white for center item, regular gray for others
        const remainingColor = isCenter ? 0xFFFFFF : 0x888888; // White for center, regular gray for others
        
        const remainingWidget = hmUI.createWidget(hmUI.widget.TEXT, {
          ...TIME_REMAINING_TEXT,
          color: remainingColor,
          text_size: isCenter ? TIME_REMAINING_TEXT.text_size + 1 : TIME_REMAINING_TEXT.text_size, // 1px bigger for center
          x: padding + itemPadding, // Keep original left padding
          y: y + px(64), // Increased top margin for more spacing
          w: itemWidth - (itemPadding * 2), // Original width
          h: px(40), // Increased height to ensure full visibility
          text: remainingText,
        });
        prayerWidgets.push(remainingWidget);
      }
      
      // Set up timer to update time remaining
      // Update every second for next prayer counter, every minute for others
      if (nextPrayerIndex >= 0 && !updateTimer) {
        updateTimer = setInterval(() => {
          this.renderPrayerTimeList(data);
        }, 1000); // Update every second for hh:mm:ss counter
      }
    },
    fetchData(action) {
      // Reset rotation when fetching new data (unless it's a location change)
      if (action === '' || action === undefined) {
        rotationOffset = 0; // Reset rotation on initial load or refresh
        isInitialLoad = true; // Reset initial load flag
      }
      
      // Cancel any pending request
      if (currentRequest) {
        // Note: BasePage request might not support cancellation, but we can track it
        currentRequest = null;
      }
      
      this.showLoading();
      currentRequest = this.request({
        method: "GET_DATA",
        params: {
          action
        }
      });
      
      currentRequest
        .then((data) => {
          // Only process if this is still the current request
          if (currentRequest === null) return;
          
          logger.log("receive data");
          
          if (!data || !data.result || !Array.isArray(data.result) || !data.result.length) {
            deleteAllWidgets();
            headerWidget = hmUI.createWidget(hmUI.widget.TEXT, {
              ...HEADER_TEXT,
              ...ERROR_TEXT,
              text: "Something went wrong!",
            });
          } else {
            // Update current city index based on the city name in the response
            const cityName = data.city;
            const cityIndex = supportedCities.findIndex(city => city.name === cityName);
            if (cityIndex >= 0) {
              currentCityIndex = cityIndex;
            }
            this.renderPrayerTimeList(data);
          }
          currentRequest = null;
        })
        .catch((err) => {
          currentRequest = null;
          logger.error("fetchData error:", err);
        });
    },
    destroy() {
      // Cancel any pending request
      currentRequest = null;
      // Clean up all widgets when page is destroyed
      deleteAllWidgets();
    },
  })
);
