        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const qrcodeEl = document.getElementById('qrcode');
            const qrInput = document.getElementById('qr-input');
            const generateBtn = document.getElementById('generate-btn');
            const toggleAdvanced = document.getElementById('toggle-advanced');
            const advancedOptions = document.getElementById('advanced-options');
            const qrType = document.getElementById('qr-type');
            const qrColor = document.getElementById('qr-color');
            const bgColor = document.getElementById('bg-color');
            const qrSize = document.getElementById('qr-size');
            const sizeValue = document.getElementById('size-value');
            const encryptToggle = document.getElementById('encrypt-toggle');
            const encryptPassword = document.getElementById('encrypt-password');
            const downloadPng = document.getElementById('download-png');
            const downloadSvg = document.getElementById('download-svg');
            const downloadJpg = document.getElementById('download-jpg');
            const scanToggle = document.getElementById('scan-toggle');
            const stopScan = document.getElementById('stop-scan');
            const scannerSection = document.getElementById('scan-section');
            const copyBtn = document.getElementById('copy-btn');
            const shareBtn = document.getElementById('share-btn');
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            const historyList = document.getElementById('history-list');
            const clearHistory = document.getElementById('clear-history');
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toast-message');
            const generateWifi = document.getElementById('generate-wifi');
            
            // Initialize QR Code
            let qrcode = null;
            let currentQRData = "";
            let scanner = null;
            let history = JSON.parse(localStorage.getItem('qrHistory')) || [];
            
            // Initialize the QR code generator
            function initQRCode() {
                if (qrcode) {
                    qrcodeEl.innerHTML = '';
                }
                qrcode = new QRCode(qrcodeEl, {
                    text: "https://example.com",
                    width: 200,
                    height: 200,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });
                qrcodeEl.querySelector('.qrcode-placeholder').classList.add('hidden');
            }
            
            // Show toast message
            function showToast(message, isSuccess = true) {
                toastMessage.textContent = message;
                toast.className = isSuccess ? 'toast success' : 'toast error';
                toast.classList.add('show');
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }
            
            // Generate QR Code
            function generateQR() {
                const text = qrInput.value.trim();
                if (!text) {
                    showToast("Please enter text or URL!", false);
                    return;
                }
                
                let qrData = text;
                
                // Handle encryption
                if (encryptToggle.checked && encryptPassword.value) {
                    const encrypted = CryptoJS.AES.encrypt(text, encryptPassword.value).toString();
                    qrData = `ENCRYPTED:${encrypted}`;
                }
                
                currentQRData = qrData;
                
                // Generate QR with custom colors
                qrcode.clear();
                qrcode.makeCode(qrData);
                applyCustomStyles();
                
                // Add to history
                addToHistory(text);
                
                showToast("QR code generated successfully!");
            }
            
            // Apply custom styles
            function applyCustomStyles() {
                const size = parseInt(qrSize.value);
                qrcode._htOption.width = size;
                qrcode._htOption.height = size;
                qrcode._htOption.colorDark = qrColor.value;
                qrcode._htOption.colorLight = bgColor.value;
                qrcode.makeCode(currentQRData);
            }
            
            // Add to history
            function addToHistory(text) {
                // Add to beginning of history
                history.unshift({
                    text: text,
                    timestamp: new Date().toISOString()
                });
                
                // Keep only last 10 items
                if (history.length > 10) {
                    history.pop();
                }
                
                localStorage.setItem('qrHistory', JSON.stringify(history));
                renderHistory();
            }
            
            // Render history
            function renderHistory() {
                historyList.innerHTML = '';
                
                if (history.length === 0) {
                    historyList.innerHTML = '<p>No history yet. Generate some QR codes!</p>';
                    return;
                }
                
                history.forEach((item, index) => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    
                    // Create a small QR for history
                    const qrContainer = document.createElement('div');
                    qrContainer.className = 'history-qr';
                    
                    // Use a simple representation for demo
                    qrContainer.innerHTML = `<i class="fas fa-qrcode" style="font-size: 2.5rem; color: ${getRandomColor()}"></i>`;
                    
                    const textEl = document.createElement('div');
                    textEl.className = 'history-text';
                    textEl.textContent = item.text.substring(0, 20) + (item.text.length > 20 ? '...' : '');
                    
                    historyItem.appendChild(qrContainer);
                    historyItem.appendChild(textEl);
                    
                    historyItem.addEventListener('click', () => {
                        qrInput.value = item.text;
                        generateQR();
                    });
                    
                    historyList.appendChild(historyItem);
                });
            }
            
            // Helper to generate random color
            function getRandomColor() {
                const colors = ['#6c5ce7', '#00cec9', '#fd79a8', '#fdcb6e', '#00b894'];
                return colors[Math.floor(Math.random() * colors.length)];
            }
            
            // Download QR Code
            function downloadQR(format) {
                const canvas = qrcodeEl.querySelector('canvas');
                if (!canvas) {
                    showToast("Generate a QR code first!", false);
                    return;
                }
                
                const link = document.createElement('a');
                link.href = canvas.toDataURL(`image/${format}`);
                link.download = `qrcode.${format}`;
                link.click();
            }
            
            // Toggle scanner
            function toggleScanner() {
                if (scannerSection.classList.contains('hidden')) {
                    startScanner();
                } else {
                    stopScanner();
                }
            }
            
            // Start scanner
            function startScanner() {
                scannerSection.classList.remove('hidden');
                
                // For demo purposes, we'll simulate scanning
                setTimeout(() => {
                    stopScanner();
                    const simulatedData = "https://example.com/scanned-data";
                    qrInput.value = simulatedData;
                    generateQR();
                    showToast("QR code scanned successfully!");
                }, 2000);
            }
            
            // Stop scanner
            function stopScanner() {
                scannerSection.classList.add('hidden');
            }
            
            // Copy QR to clipboard
            function copyQR() {
                const canvas = qrcodeEl.querySelector('canvas');
                if (!canvas) {
                    showToast("Generate a QR code first!", false);
                    return;
                }
                
                canvas.toBlob(blob => {
                    const item = new ClipboardItem({ "image/png": blob });
                    navigator.clipboard.write([item]);
                });
                
                showToast("QR code copied to clipboard!");
            }
            
            // Share QR
            function shareQR() {
                const canvas = qrcodeEl.querySelector('canvas');
                if (!canvas) {
                    showToast("Generate a QR code first!", false);
                    return;
                }
                
                canvas.toBlob(blob => {
                    const file = new File([blob], "qrcode.png", { type: "image/png" });
                    
                    if (navigator.share) {
                        navigator.share({
                            title: 'QR Code',
                            files: [file]
                        }).catch(console.error);
                    } else {
                        showToast("Sharing not supported in this browser", false);
                    }
                });
            }
            
            // Toggle dark mode
            function toggleDarkMode() {
                const currentTheme = document.body.getAttribute('data-theme') || 'light';
                document.body.setAttribute('data-theme', currentTheme === 'light' ? 'dark' : 'light');
                
                // Update icon
                const icon = darkModeToggle.querySelector('i');
                icon.className = currentTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
                
                // Save preference
                localStorage.setItem('theme', currentTheme === 'light' ? 'dark' : 'light');
            }
            
            // Generate Wi-Fi QR
            function generateWifiQR() {
                const ssid = document.getElementById('wifi-ssid').value.trim();
                const password = document.getElementById('wifi-password').value.trim();
                const encryption = document.getElementById('wifi-encryption').value;
                
                if (!ssid) {
                    showToast("Please enter Wi-Fi SSID!", false);
                    return;
                }
                
                let wifiString = `WIFI:T:${encryption};S:${ssid};`;
                
                if (encryption !== 'nopass' && password) {
                    wifiString += `P:${password};`;
                }
                
                wifiString += ';';
                
                qrInput.value = wifiString;
                generateQR();
            }
            
            // Event Listeners
            generateBtn.addEventListener('click', generateQR);
            qrInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') generateQR();
            });
            
            toggleAdvanced.addEventListener('click', () => {
                advancedOptions.classList.toggle('hidden');
                toggleAdvanced.classList.toggle('active');
            });
            
            qrSize.addEventListener('input', () => {
                sizeValue.textContent = `${qrSize.value}px`;
                if (currentQRData) {
                    applyCustomStyles();
                }
            });
            
            qrColor.addEventListener('input', applyCustomStyles);
            bgColor.addEventListener('input', applyCustomStyles);
            
            encryptToggle.addEventListener('change', () => {
                encryptPassword.classList.toggle('hidden', !encryptToggle.checked);
            });
            
            downloadPng.addEventListener('click', () => downloadQR('png'));
            downloadSvg.addEventListener('click', () => downloadQR('svg'));
            downloadJpg.addEventListener('click', () => downloadQR('jpeg'));
            
            scanToggle.addEventListener('click', toggleScanner);
            stopScan.addEventListener('click', stopScanner);
            
            copyBtn.addEventListener('click', copyQR);
            shareBtn.addEventListener('click', shareQR);
            
            darkModeToggle.addEventListener('click', toggleDarkMode);
            
            clearHistory.addEventListener('click', () => {
                history = [];
                localStorage.removeItem('qrHistory');
                renderHistory();
                showToast("History cleared!");
            });
            
            generateWifi.addEventListener('click', generateWifiQR);
            
            // Initialize
            initQRCode();
            renderHistory();
            
            // Set initial theme
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.body.setAttribute('data-theme', savedTheme);
            const icon = darkModeToggle.querySelector('i');
            icon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            
            // Demo QR code
            setTimeout(() => {
                qrInput.value = "https://example.com";
                generateQR();
            }, 1000);
        });