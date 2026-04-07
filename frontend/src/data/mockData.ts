import car1 from "@/assets/images/car-1.png";
import car2 from "@/assets/images/car-2.png";
import car3 from "@/assets/images/car-3.png";
import car4 from "@/assets/images/car-4.png";
import car5 from "@/assets/images/car-5.png";
import car6 from "@/assets/images/car-6.png";
import car7 from "@/assets/images/car-7.png";
import car8 from "@/assets/images/car-8.png";
import route1 from "@/assets/images/route-1.png";
import route2 from "@/assets/images/route-2.png";
import route3 from "@/assets/images/route-3.png";
import route4 from "@/assets/images/route-4.png";
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
];

export const TESTIMONIALS = [
  { name: "James Wilson", role: "CEO, TechSphere", content: "The service is incomparable. From the moment I arrived, the concierge handled everything perfectly. The Maybach was in pristine condition.", rating: 5 },
  { name: "Elena Rodriguez", role: "Fashion Designer", content: "Renting the Porsche for my tour through the Swiss Alps was the highlight of my trip. Seamless booking and incredible support.", rating: 5 },
  { name: "David Chen", role: "VC Partner", content: "Professionalism at its finest. CarRentify has become my primary mobility partner for all my international corporate travel.", rating: 5 },
];

export const SERVICES = [
  { icon: Car, title: "Chauffeur Service", desc: "Experience ultimate luxury with our professional, multilingual chauffeurs dedicated to your schedule." },
  { icon: Luggage, title: "Airport Concierge", desc: "Seamless pickup and drop-off at major global airports, including baggage handling and VIP lounge access." },
  { icon: Shield, title: "Security Detail", desc: "For high-profile clients, we provide integrated security solutions and armored vehicle options." },
  { icon: Wallet, title: "Corporate Leasing", desc: "Tailored long-term solutions for businesses requiring an elite fleet for their executive teams." },
  { icon: Zap, title: "Event Logistics", desc: "Comprehensive fleet management for weddings, galas, and international corporate events." },
  { icon: Clock, title: "24/7 Access", desc: "Our concierge team is available around the clock to manage any request or modification." },
];

export const LOCATIONS = [
  { city: "New York", address: "JFK International Airport, Terminal 4", phone: "+1 (212) 555-0123", email: "nyc@carrentify.com", hours: "24/7 Service", coordinates: "40.6413° N, 73.7781° W" },
  { city: "London", address: "Heathrow Airport, Terminal 5", phone: "+44 20 7946 0958", email: "london@carrentify.com", hours: "05:00 - 23:30 Daily", coordinates: "51.4700° N, 0.4543° W" },
  { city: "Dubai", address: "Dubai International Airport, Terminal 3", phone: "+971 4 224 5555", email: "dubai@carrentify.com", hours: "24/7 Service", coordinates: "25.2532° N, 55.3657° E" },
  { city: "Paris", address: "Charles de Gaulle Airport, Terminal 2E", phone: "+33 1 70 36 39 50", email: "paris@carrentify.com", hours: "06:00 - 23:00 Daily", coordinates: "49.0097° N, 2.5479° E" },
];

export const ADMIN_STATS = [
  { label: "Active Fleet", value: "48", change: "+12%", up: true, icon: Car, color: "bg-blue-50 text-blue-600" },
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
  { icon: Sparkles, title: "Elite Fleet", desc: "Access the latest models from the world's most prestigious automotive manufacturers." },
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
    siteName: "CarRentify",
    siteUrl: "https://carrentify.com",
    favicon: "/favicon.ico",
    isAdminPanelEnabled: true,
  },
  branding: {
    primaryColor: "#3f147b",
    secondaryColor: "#291249",
    accentColor: "#7c3aed",
    logoDark: "/logo.png",
    logoLight: "/logo-white.png",
  },
  social: {
    facebook: "https://facebook.com/carrentify",
    instagram: "https://instagram.com/carrentify",
    linkedin: "https://linkedin.com/company/carrentify",
    twitter: "https://twitter.com/carrentify",
  },
  notifications: {
    emailAlerts: true,
    smsNotifications: false,
    autoApproveBookings: false,
    maintenanceReminders: true,
  },
};
