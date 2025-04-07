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

// Sample Listings
const listings = [
    { name: "Hotel Asansol Inn", type: "Hotel", price: "₹2000/night", lat: 23.6868, lng: 86.9754 },
    { name: "PG Near Station", type: "Room", price: "₹5000/month", lat: 23.6833, lng: 86.9667 }
];

// Display Listings
function displayListings() {
    const container = document.getElementById("listingContainer");
    container.innerHTML = "";
    listings.forEach(listing => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${listing.name}</strong> (${listing.type}) - ${listing.price}`;
        container.appendChild(div);
    });
}

// Search Functionality
document.getElementById("searchBar").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = listings.filter(l => l.name.toLowerCase().includes(query));
    const container = document.getElementById("listingContainer");
    container.innerHTML = "";
    filtered.forEach(listing => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${listing.name}</strong> (${listing.type}) - ${listing.price}`;
        container.appendChild(div);
    });
});

// Submit Review to Firestore
function submitReview() {
    const placeName = document.getElementById("placeName").value;
    const reviewText = document.getElementById("reviewText").value;
    const rating = document.getElementById("rating").value;

    if (placeName && reviewText) {
        db.collection("reviews").add({
            place: placeName,
            review: reviewText,
            rating: parseInt(rating),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert("Review submitted!");
            loadReviews();
        }).catch(error => console.error("Error adding review: ", error));
    }
}

// Load Reviews from Firestore
function loadReviews() {
    const container = document.getElementById("reviewContainer");
    container.innerHTML = "";
    db.collection("reviews").orderBy("timestamp", "desc").get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement("div");
            div.innerHTML = `<strong>${data.place}</strong>: ${data.review} (${data.rating} stars)`;
            container.appendChild(div);
        });
    });
}

// Initialize Leaflet Map
function initMap() {
    const asansol = [23.6833, 86.9667];
    const map = L.map('map').setView(asansol, 12); // Zoom level 12

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    listings.forEach(listing => {
        L.marker([listing.lat, listing.lng])
            .addTo(map)
            .bindPopup(`<strong>${listing.name}</strong><br>${listing.price}`);
    });
}

// Initialize everything
displayListings();
loadReviews();
initMap();