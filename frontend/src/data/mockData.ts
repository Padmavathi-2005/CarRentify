const car1 = "https://images.unsplash.com/photo-1544636331-e26879bc4d9b?w=800&auto=format&fit=crop&q=60";
const car2 = "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&auto=format&fit=crop&q=60";
const car3 = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=60";
const car4 = "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=60";
const car5 = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=60";
const car6 = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=60";
const car7 = "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=60";
const car8 = "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=60";

const route1 = "https://images.unsplash.com/photo-1565799877535-7c63e7eda70e?w=600&auto=format&fit=crop";
const route2 = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&auto=format&fit=crop";
const route3 = "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&auto=format&fit=crop";
const route4 = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&auto=format&fit=crop";
const route5 = "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=600&auto=format&fit=crop";
const route6 = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop";
const route7 = "https://images.unsplash.com/photo-1512100356956-c1227c331f01?w=600&auto=format&fit=crop";

import { Car, Zap, Mountain, Truck, Gauge, Shield, Luggage, Wallet, Users, Clock, Award, Star, Mail, MapPin, Phone, Globe, Calendar, DollarSign, CheckCircle2, Sparkles } from "lucide-react";

export const CARS = [
  { id: 1, name: "Mercedes Maybach S-Class", type: "Sedan", price: 150, image: car1, rating: 5.0, reviews: 124, badge: "Popular", fuel: "Hybrid", speed: "250 km/h", plate: "NYC-7788", status: "Available" },
  { id: 2, name: "Audi e-tron GT", type: "Electric", price: 120, image: car2, rating: 4.8, reviews: 89, badge: "New", fuel: "Electric", speed: "245 km/h", plate: "LON-4422", status: "Booked" },
  { id: 3, name: "Porsche 911 Carrera", type: "Sports", price: 200, image: car3, rating: 4.9, reviews: 210, badge: "Popular", fuel: "Gasoline", speed: "293 km/h", plate: "DXB-9900", status: "Maintenance" },
  { id: 4, name: "BMW X7 M50i", type: "SUV", price: 180, image: car4, rating: 4.7, reviews: 156, badge: null, fuel: "Gasoline", speed: "250 km/h", plate: "PAR-1122", status: "Available" },
  { id: 5, name: "Mercedes-Benz S-Class", type: "Sedan", price: 140, image: car5, rating: 4.9, reviews: 342, badge: "Popular", fuel: "Gasoline", speed: "250 km/h", plate: "NYC-2233", status: "Available" },
  { id: 6, name: "Land Rover Defender", type: "Off-road", price: 160, image: car6, rating: 4.8, reviews: 112, badge: "New", fuel: "Gasoline", speed: "209 km/h", plate: "SFO-6655", status: "Available" },
  { id: 7, name: "Ferrari F8 Tributo", type: "Sports", price: 450, image: car7, rating: 5.0, reviews: 45, badge: "Exclusive", fuel: "Gasoline", speed: "340 km/h", plate: "MIA-0077", status: "Booked" },
  { id: 8, name: "Bentley Continental GT", type: "Convertible", price: 350, image: car8, rating: 4.9, reviews: 78, badge: null, fuel: "Gasoline", speed: "318 km/h", plate: "LON-3344", status: "Available" },
];

export const DESTINATIONS = [
  { id: 1, name: "Amalfi Coast", country: "Italy", image: route1, distance: "45 km", duration: "1.5 hrs" },
  { id: 2, name: "Scenic Alps", country: "Switzerland", image: route2, distance: "120 km", duration: "2.5 hrs" },
  { id: 3, name: "Golden Gate", country: "USA", image: route3, distance: "12 km", duration: "30 min" },
  { id: 4, name: "Dubai Marina", country: "UAE", image: route4, distance: "28 km", duration: "45 min" },
  { id: 5, name: "Moscow City", country: "Russia", image: route5, distance: "15 km", duration: "25 min" },
  { id: 6, name: "Paris Centre", country: "France", image: route6, distance: "10 km", duration: "20 min" },
  { id: 7, name: "Tokyo Skyline", country: "Japan", image: route7, distance: "22 km", duration: "40 min" },
];

export const TESTIMONIALS = [
  { name: "James Wilson", role: "CEO, TechSphere", content: "The service is incomparable. From the moment I arrived, the concierge handled everything perfectly. The Maybach was in pristine condition.", rating: 5 },
  { name: "Elena Rodriguez", role: "Fashion Designer", content: "Renting the Porsche for my tour through the Swiss Alps was the highlight of my trip. Seamless booking and incredible support.", rating: 5 },
  { name: "David Chen", role: "VC Partner", content: "Professionalism at its finest. CarRental has become my primary mobility partner for all my international corporate travel.", rating: 5 },
];

export const SERVICES = [
  { icon: Car, title: "Chauffeur Service", desc: "Experience ultimate luxury with our professional, multilingual chauffeurs dedicated to your schedule." },
  { icon: Luggage, title: "Airport Concierge", desc: "Seamless pickup and drop-off at major global airports, including baggage handling and VIP lounge access." },
  { icon: Shield, title: "Security Detail", desc: "For high-profile clients, we provide integrated security solutions and armored vehicle options." },
  { icon: Wallet, title: "Corporate Leasing", desc: "Tailored long-term solutions for businesses requiring an elite car collection for their executive teams." },
  { icon: Zap, title: "Event Logistics", desc: "Comprehensive car management for weddings, galas, and international corporate events." },
  { icon: Clock, title: "24/7 Access", desc: "Our concierge team is available around the clock to manage any request or modification." },
];

export const LOCATIONS = [
  { city: "New York", address: "JFK International Airport, Terminal 4", phone: "+1 (212) 555-0123", email: "nyc@carrental.com", hours: "24/7 Service", coordinates: "40.6413° N, 73.7781° W" },
  { city: "London", address: "Heathrow Airport, Terminal 5", phone: "+44 20 7946 0958", email: "london@carrental.com", hours: "05:00 - 23:30 Daily", coordinates: "51.4700° N, 0.4543° W" },
  { city: "Dubai", address: "Dubai International Airport, Terminal 3", phone: "+971 4 224 5555", email: "dubai@carrental.com", hours: "24/7 Service", coordinates: "25.2532° N, 55.3657° E" },
  { city: "Paris", address: "Charles de Gaulle Airport, Terminal 2E", phone: "+33 1 70 36 39 50", email: "paris@carrental.com", hours: "06:00 - 23:00 Daily", coordinates: "49.0097° N, 2.5479° E" },
];

export const ADMIN_STATS = [
  { label: "Active Cars", value: "48", change: "+12%", up: true, icon: Car, color: "bg-blue-50 text-blue-600" },
  { label: "Total Bookings", value: "892", change: "+8.4%", up: true, icon: Calendar, color: "bg-emerald-50 text-emerald-600" },
  { label: "Customer Base", value: "12,450", change: "-2.1%", up: false, icon: Users, color: "bg-violet-50 text-violet-600" },
  { label: "Revenue (MTD)", value: "$64.2k", change: "+18.2%", up: true, icon: DollarSign, color: "bg-amber-50 text-amber-600" },
];

export const VEHICLE_TYPES = [
  { name: "All", icon: CheckCircle2 },
  { name: "Sedan", icon: Car },
  { name: "SUV", icon: Truck },
  { name: "Sports", icon: Car },
  { name: "Electric", icon: Zap },
  { name: "Off-road", icon: Mountain },
];

export const ABOUT_VALUES = [
  { icon: Shield, title: "Uncompromising Security", desc: "Our vehicle inspections and client security standards are second to none in the industry." },
  { icon: Award, title: "Excellence Guaranteed", desc: "Every journey is a testament to our commitment to perfection and high-performance logistics." },
  { icon: Users, title: "Client First", desc: "From personalized concierge to bespoke delivery, your experience is our singular focus." },
  { icon: Sparkles, title: "Elite Cars", desc: "Access the latest models from the world's most prestigious automotive manufacturers." },
];

export const ABOUT_STATS = [
  { value: "45+", label: "Destinations" },
  { value: "5000+", label: "Happy Clients" },
  { value: "100+", label: "Luxury Cars" },
  { value: "24/7", label: "Global Support" },
];

export const ADMIN_ACTIVITY = [
  { car: "Mercedes Maybach S-Class", user: "Alexander Pierce", action: "Pickup Scheduled", status: "Confirming", time: "12 min ago" },
  { car: "Porsche 911 Carrera", user: "Sophie Montgomery", action: "Booking Extended", status: "Active", time: "45 min ago" },
  { car: "Land Rover Defender", user: "Julian Rossi", action: "Return Inspection", status: "Review", time: "2 hours ago" },
  { car: "Audi e-tron GT", user: "Nathan Drake", action: "New Booking", status: "Active", time: "5 hours ago" },
];

export const ADMIN_TASKS = [
  { task: "Approve Driver Verification", user: "Mark Evans", time: "Now" },
  { task: "Vehicle Maintenance Due", car: "BMW X5", time: "2h ago" },
  { task: "Pending Refund Request", user: "Sarah L.", time: "Yesterday" },
];

export const SITE_SETTINGS = {
  general: {
    siteName: "CarRental",
    siteUrl: "https://carrental.com",
    favicon: "/favicon.ico",
    isAdminPanelEnabled: true,
    heroImageUrl: "/hero-car.png",
  },
  branding: {
    primaryColor: "#e31c5f",
    secondaryColor: "#bd174f",
    accentColor: "#f472b6",
    logoDark: "/logo.png",
    logoLight: "/logo-white.png",
  },
  social: {
    facebook: "https://facebook.com/carrental",
    instagram: "https://instagram.com/carrental",
    linkedin: "https://linkedin.com/company/carrental",
    twitter: "https://twitter.com/carrental",
  },
  notifications: {
    emailAlerts: true,
    smsNotifications: false,
    autoApproveBookings: false,
    maintenanceReminders: true,
  },
};
