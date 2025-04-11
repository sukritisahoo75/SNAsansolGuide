// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWA8vGHOsCaE_3CMrZ4gmsYSXoqMuoE4s",
    authDomain: "snasansolguide.firebaseapp.com",
    projectId: "snasansolguide",
    storageBucket: "snasansolguide.firebasestorage.app",
    messagingSenderId: "805880502572",
    appId: "1:805880502572:web:4fb0296487e28f37573489"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global map, markers, and route line
let map;
let markers = [];
let routeLine = null;

// Initialize Leaflet Map with OpenStreetMap tiles
function initMap() {
    const asansol = [23.6833, 86.9667];
    map = L.map('map').setView(asansol, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    loadListings(); // Load initial listings
}

// Clear existing markers and route line from the map
function clearMarkers() {
    markers.forEach(marker => marker.remove());
    if (routeLine) routeLine.remove();
    markers = [];
    routeLine = null;
}

// Load Listings from Firestore
function loadListings(searchQuery = "") {
    const container = document.getElementById("listingContainer");
    const searchedSection = document.getElementById("searchedDestination");
    const destinationName = document.getElementById("destinationName");
    container.innerHTML = "";
    clearMarkers();

    db.collection("listings").get().then(querySnapshot => {
        let hasMatches = false;
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const queryLower = searchQuery.toLowerCase();
            const matchesSearch = queryLower === "" || data.name.toLowerCase().includes(queryLower);

            if (matchesSearch) {
                hasMatches = true;
                const isPgRoute = data.name === "PG in Asansol Cum Room Rent" && 
                    (queryLower.includes("pg") || queryLower.includes("room") || queryLower.includes("asansol"));
                const routeLink = isPgRoute && data.routeLink ? 
                    `<br><a href="${data.routeLink}" target="_blank">View Route (1.1 km, 3 min)</a>` : "";
                
                const div = document.createElement("div");
                div.innerHTML = `
                    <strong>${data.name}</strong> (${data.type}) - ${data.price} ${routeLink}
                    <div class="review-form" id="review-${doc.id}" style="display: ${searchQuery ? 'block' : 'none'};">
                        <input type="text" placeholder="Your review" class="reviewText" data-place="${data.name}">
                        <select class="rating">
                            <option value="1">1 Star</option>
                            <option value="2">2 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="5">5 Stars</option>
                        </select>
                        <button onclick="submitReview('${doc.id}')">Submit Review</button>
                    </div>
                `;
                container.appendChild(div);

                const marker = L.marker([data.lat, data.lng])
                    .addTo(map)
                    .bindPopup(`<strong>${data.name}</strong><br>${data.price}`);
                markers.push(marker);

                // Add route for "PG in Asansol Cum Room Rent" only on specific matches
                if (isPgRoute) {
                    const startPoint = [23.6901893, 86.9925806];
                    const endPoint = [data.lat, data.lng];
                    markers.push(L.marker(startPoint).addTo(map).bindPopup("Start Point"));
                    routeLine = L.polyline([startPoint, endPoint], { color: 'blue' }).addTo(map);
                    map.fitBounds([startPoint, endPoint]);
                }
            }
        });

        if (searchQuery === "") {
            searchedSection.style.display = "none";
            map.setView([23.6833, 86.9667], 12); // Reset to Asansol
        } else {
            searchedSection.style.display = "block";
            destinationName.textContent = `Showing results for: ${searchQuery}`;
            if (!hasMatches) {
                container.innerHTML = "<p>No matching listings found.</p>";
            }
        }
    }).catch(error => console.error("Error loading listings: ", error));
}

// Search Functionality
document.getElementById("searchBar").addEventListener("input", (e) => {
    const query = e.target.value.trim();
    loadListings(query);
});

// Submit Review to Firestore
function submitReview(listingId) {
    const reviewText = document.querySelector(`#review-${listingId} .reviewText`).value;
    const rating = document.querySelector(`#review-${listingId} .rating`).value;
    const placeName = document.querySelector(`#review-${listingId} .reviewText`).getAttribute("data-place");

    if (reviewText) {
        db.collection("reviews").add({
            place: placeName,
            review: reviewText,
            rating: parseInt(rating),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert("Review submitted!");
            document.querySelector(`#review-${listingId} .reviewText`).value = ""; // Clear input
        }).catch(error => console.error("Error adding review: ", error));
    }
}

// Initialize everything
initMap();