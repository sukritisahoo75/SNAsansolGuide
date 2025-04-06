// Firebase Config (replace with your own from Firebase Console)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Sample Listings (you can add more manually or fetch from Firestore)
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

// Google Maps Integration
function initMap() {
    const asansol = { lat: 23.6833, lng: 86.9667 }; // Center of Asansol
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: asansol
    });
    listings.forEach(listing => {
        new google.maps.Marker({
            position: { lat: listing.lat, lng: listing.lng },
            map: map,
            title: listing.name
        });
    });
}

// Initialize
displayListings();
loadReviews();