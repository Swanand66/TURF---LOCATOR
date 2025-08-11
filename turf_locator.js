/*

================================================================================

File: App.js (Main Entry Point & Navigation)

================================================================================

This file sets up the core navigation, UI theme, and structure for the app.

*/



import React, { useState, useEffect } from 'react';

import { 

  NavigationContainer 

} from '@react-navigation/native';

import { 

  createNativeStackNavigator 

} from '@react-navigation/native-stack';

import { 

  View, Text, StyleSheet, FlatList, Button, SafeAreaView, 

  ScrollView, Image, TouchableOpacity, Modal, Alert, ActivityIndicator 

} from 'react-native';

import MapView, { Marker } from 'react-native-maps';



// --- MOCK DATA & CONFIGURATION ---



// User's location (Defaulting to a central point in Pune for demonstration)

const USER_LOCATION = {

  latitude: 18.5204,

  longitude: 73.8567,

};



// Mock database of turfs

const MOCK_TURFS = [

  { 

    id: '1', 

    name: 'Kicker\'s Paradise', 

    area: 'Koregaon Park', 

    price: 1500, 

    rating: 4.8,

    imageUrl: 'https://placehold.co/600x400/22C55E/FFFFFF?text=Kicker%27s+Paradise', 

    coordinates: { latitude: 18.5361, longitude: 73.8937 },

    sports: ['Football', 'Cricket'],

    reviews: [

      { user: 'Rohan', rating: 5, comment: 'Amazing pitch quality!' },

      { user: 'Priya', rating: 4, comment: 'Good lights for night games.' }

    ],

    availableSlots: ['09:00 AM', '11:00 AM', '04:00 PM', '06:00 PM', '08:00 PM']

  },

  { 

    id: '2', 

    name: 'Goal Getters Arena', 

    area: 'Viman Nagar', 

    price: 1200, 

    rating: 4.5,

    imageUrl: 'https://placehold.co/600x400/3B82F6/FFFFFF?text=Goal+Getters', 

    coordinates: { latitude: 18.5679, longitude: 73.9143 },

    sports: ['Football'],

    reviews: [{ user: 'Amit', rating: 4, comment: 'Well maintained and friendly staff.' }],

    availableSlots: ['10:00 AM', '01:00 PM', '03:00 PM', '05:00 PM']

  },

  { 

    id: '3', 

    name: 'The Football Hub', 

    area: 'Baner', 

    price: 1400, 

    rating: 4.7,

    imageUrl: 'https://placehold.co/600x400/F97316/FFFFFF?text=The+Football+Hub', 

    coordinates: { latitude: 18.5590, longitude: 73.7868 },

    sports: ['5-a-side Football', 'Box Cricket'],

    reviews: [{ user: 'Sneha', rating: 5, comment: 'Perfect for a quick game after work.' }],

    availableSlots: ['08:00 AM', '05:00 PM', '07:00 PM', '09:00 PM']

  },

   { 

    id: '4', 

    name: 'South United Club', 

    area: 'Kothrud', 

    price: 1600, 

    rating: 4.9,

    imageUrl: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=South+United', 

    coordinates: { latitude: 18.5074, longitude: 73.8095 },

    sports: ['11-a-side Football', 'Cricket'],

    reviews: [{ user: 'Vikram', rating: 5, comment: 'Best professional ground in Pune.' }],

    availableSlots: ['07:00 AM', '09:00 AM', '04:00 PM']

  },

];



// --- HELPER FUNCTION ---

// Calculates distance between two coordinates in KM (Haversine formula)

const getDistance = (coord1, coord2) => {

  const R = 6371; // Radius of the Earth in km

  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;

  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a =

    Math.sin(dLat / 2) * Math.sin(dLat / 2) +

    Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *

    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R.toFixed(1); // Returns distance in KM, rounded to 1 decimal

};





/*

================================================================================

Component: TurfCard

================================================================================

A beautiful, reusable card to display a turf's summary information.

*/

function TurfCard({ turf, onPress }) {

  const distance = getDistance(USER_LOCATION, turf.coordinates);



  return (

    <TouchableOpacity style={cardStyles.card} onPress={onPress}>

      <Image source={{ uri: turf.imageUrl }} style={cardStyles.image} />

      <View style={cardStyles.infoContainer}>

        <Text style={cardStyles.title}>{turf.name}</Text>

        <Text style={cardStyles.location}>📍 {turf.area}</Text>

        <Text style={cardStyles.distance}>🚗 {distance} km away</Text>

        <View style={cardStyles.priceRatingContainer}>

          <Text style={cardStyles.price}>₹{turf.price}/hr</Text>

          <Text style={cardStyles.rating}>⭐ {turf.rating}</Text>

        </View>

      </View>

    </TouchableOpacity>

  );

}



const cardStyles = StyleSheet.create({

  card: {

    backgroundColor: 'white',

    borderRadius: 16,

    marginBottom: 16,

    elevation: 5,

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,

    shadowRadius: 8,

  },

  image: {

    width: '100%',

    height: 180,

    borderTopLeftRadius: 16,

    borderTopRightRadius: 16,

  },

  infoContainer: {

    padding: 15,

  },

  title: {

    fontSize: 20,

    fontWeight: 'bold',

    color: '#1F2937',

  },

  location: {

    fontSize: 14,

    color: '#4B5563',

    marginTop: 4,

  },

  distance: {

    fontSize: 14,

    color: '#4B5563',

    marginTop: 4,

    fontStyle: 'italic',

  },

  priceRatingContainer: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginTop: 12,

  },

  price: {

    fontSize: 18,

    fontWeight: 'bold',

    color: '#059669',

  },

  rating: {

    fontSize: 16,

    fontWeight: 'bold',

    color: '#F59E0B',

  },

});





/*

================================================================================

Component: BookingModal

================================================================================

A pop-up modal to confirm a booking with the selected time slot.

*/

function BookingModal({ visible, turf, selectedSlot, onClose, onConfirm }) {

  if (!turf) return null;



  return (

    <Modal

      animationType="fade"

      transparent={true}

      visible={visible}

      onRequestClose={onClose}

    >

      <View style={modalStyles.centeredView}>

        <View style={modalStyles.modalView}>

          <Text style={modalStyles.modalTitle}>Confirm Your Booking</Text>

          <Image source={{ uri: turf.imageUrl }} style={modalStyles.modalImage} />

          <Text style={modalStyles.turfName}>{turf.name}</Text>

          <Text style={modalStyles.modalText}>You have selected the slot:</Text>

          <Text style={modalStyles.slotText}>{selectedSlot}</Text>

          <Text style={modalStyles.modalPrice}>Total Price: ₹{turf.price}</Text>

          

          <View style={modalStyles.buttonRow}>

            <TouchableOpacity style={[modalStyles.button, modalStyles.cancelButton]} onPress={onClose}>

                <Text style={modalStyles.buttonText}>Cancel</Text>

            </TouchableOpacity>

            <TouchableOpacity style={[modalStyles.button, modalStyles.confirmButton]} onPress={onConfirm}>

                <Text style={modalStyles.buttonText}>Confirm & Book</Text>

            </TouchableOpacity>

          </View>

        </View>

      </View>

    </Modal>

  );

}



const modalStyles = StyleSheet.create({

  centeredView: {

    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: 'rgba(0,0,0,0.7)',

  },

  modalView: {

    width: '90%',

    backgroundColor: 'white',

    borderRadius: 20,

    padding: 25,

    alignItems: 'center',

    elevation: 5,

  },

  modalImage: {

      width: 100,

      height: 100,

      borderRadius: 50,

      marginBottom: 15,

      borderWidth: 3,

      borderColor: '#10B981',

  },

  modalTitle: {

    fontSize: 22,

    fontWeight: 'bold',

    marginBottom: 15,

  },

  turfName: {

    fontSize: 18,

    fontWeight: '600',

    color: '#1F2937',

    marginBottom: 10,

  },

  modalText: {

    fontSize: 16,

    marginBottom: 5,

    textAlign: 'center',

    color: '#374151',

  },

  slotText: {

    fontSize: 18,

    fontWeight: 'bold',

    color: '#059669',

    backgroundColor: '#D1FAE5',

    paddingVertical: 5,

    paddingHorizontal: 15,

    borderRadius: 10,

    overflow: 'hidden',

    marginVertical: 10,

  },

  modalPrice: {

    fontSize: 16,

    fontWeight: 'bold',

    marginTop: 5,

    marginBottom: 25,

  },

  buttonRow: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    width: '100%',

  },

  button: {

      flex: 1,

      paddingVertical: 12,

      borderRadius: 10,

      alignItems: 'center',

      marginHorizontal: 5,

  },

  cancelButton: {

      backgroundColor: '#EF4444',

  },

  confirmButton: {

      backgroundColor: '#10B981',

  },

  buttonText: {

      color: 'white',

      fontWeight: 'bold',

      fontSize: 16,

  }

});





/*

================================================================================

Screen: HomeScreen

================================================================================

The main screen with a toggle for List View and Map View.

*/

function HomeScreen({ navigation }) {

  const [isMapView, setIsMapView] = useState(false);



  return (

    <SafeAreaView style={homeStyles.container}>

      <View style={homeStyles.toggleContainer}>

        <TouchableOpacity style={homeStyles.toggleButton} onPress={() => setIsMapView(!isMapView)}>

            <Text style={homeStyles.toggleButtonText}>{isMapView ? "📄 Show List View" : "🗺️ Show Map View"}</Text>

        </TouchableOpacity>

      </View>



      {isMapView ? (

        <MapView

          style={homeStyles.map}

          initialRegion={{

            latitude: USER_LOCATION.latitude,

            longitude: USER_LOCATION.longitude,

            latitudeDelta: 0.15,

            longitudeDelta: 0.15,

          }}

        >

          <Marker coordinate={USER_LOCATION} title="Your Location" pinColor="blue" />

          {MOCK_TURFS.map(turf => (

            <Marker

              key={turf.id}

              coordinate={turf.coordinates}

              title={turf.name}

              description={`₹${turf.price}/hr | ${turf.rating} ⭐`}

              pinColor="#10B981"

              onCalloutPress={() => navigation.navigate('TurfDetail', { turfId: turf.id })}

            />

          ))}

        </MapView>

      ) : (

        <FlatList

          data={MOCK_TURFS}

          keyExtractor={item => item.id}

          renderItem={({ item }) => (

            <TurfCard 

              turf={item} 

              onPress={() => navigation.navigate('TurfDetail', { turfId: item.id })} 

            />

          )}

          contentContainerStyle={homeStyles.list}

        />

      )}

    </SafeAreaView>

  );

}



const homeStyles = StyleSheet.create({

  container: { flex: 1, backgroundColor: '#F0FDF4' },

  toggleContainer: { 

      padding: 15, 

      backgroundColor: '#fff', 

      alignItems: 'center',

  },

  toggleButton: {

      backgroundColor: '#10B981',

      paddingVertical: 10,

      paddingHorizontal: 20,

      borderRadius: 20,

      elevation: 3,

  },

  toggleButtonText: {

      color: 'white',

      fontWeight: 'bold',

      fontSize: 16,

  },

  list: { paddingHorizontal: 15, paddingTop: 15 },

  map: { flex: 1 },

});





/*

================================================================================

Screen: TurfDetailScreen

================================================================================

Shows all details for a selected turf, including reviews and booking slots.

*/

function TurfDetailScreen({ route }) {

  const { turfId } = route.params;

  const [turf, setTurf] = useState(null);

  const [selectedSlot, setSelectedSlot] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);



  useEffect(() => {

    // Simulates fetching data from a database

    const turfData = MOCK_TURFS.find(t => t.id === turfId);

    setTurf(turfData);

  }, [turfId]);



  const handleBookNow = () => {

    if (!selectedSlot) {

      Alert.alert("Select a Slot", "Please choose an available time slot before booking.");

      return;

    }

    setModalVisible(true);

  };



  const handleBookingConfirm = () => {

    // In a real app, this would send data to Firebase and handle analytics

    console.log(`Booking confirmed for ${turf.name} at ${selectedSlot}`);

    setModalVisible(false);

    Alert.alert("Booking Successful!", `Your booking for ${turf.name} at ${selectedSlot} is confirmed. Enjoy your game!`, [{ text: "Awesome!" }]);

    navigation.goBack();

  };



  if (!turf) {

    return <ActivityIndicator size="large" color="#10B981" style={{flex: 1}} />;

  }



  return (

    <SafeAreaView style={detailStyles.container}>

      <ScrollView>

        <Image source={{ uri: turf.imageUrl }} style={detailStyles.image} />

        <View style={detailStyles.contentContainer}>

          <Text style={detailStyles.name}>{turf.name}</Text>

          <Text style={detailStyles.detail}>📍 {turf.area}</Text>

          <Text style={detailStyles.detail}>⚽ Sports: {turf.sports.join(', ')}</Text>

          <Text style={detailStyles.price}>💰 Price: ₹{turf.price} / hour</Text>

          

          <View style={detailStyles.section}>

            <Text style={detailStyles.sectionTitle}>Select a Time Slot</Text>

            <View style={detailStyles.slotsContainer}>

                {turf.availableSlots.map(slot => (

                    <TouchableOpacity 

                        key={slot} 

                        style={[detailStyles.slot, selectedSlot === slot && detailStyles.selectedSlot]}

                        onPress={() => setSelectedSlot(slot)}

                    >

                        <Text style={[detailStyles.slotText, selectedSlot === slot && detailStyles.selectedSlotText]}>{slot}</Text>

                    </TouchableOpacity>

                ))}

            </View>

          </View>



          <View style={detailStyles.section}>

            <Text style={detailStyles.sectionTitle}>User Reviews ⭐</Text>

            {turf.reviews.map((review, index) => (

              <View key={index} style={detailStyles.review}>

                <Text style={detailStyles.reviewText}>"{review.comment}"</Text>

                <Text style={detailStyles.reviewAuthor}>- {review.user} ({'⭐'.repeat(review.rating)})</Text>

              </View>

            ))}

          </View>

        </View>

      </ScrollView>

      <View style={detailStyles.footer}>

          <TouchableOpacity style={detailStyles.bookButton} onPress={handleBookNow}>

              <Text style={detailStyles.bookButtonText}>Book Now</Text>

          </TouchableOpacity>

      </View>

      <BookingModal 

        visible={modalVisible} 

        turf={turf}

        selectedSlot={selectedSlot}

        onClose={() => setModalVisible(false)}

        onConfirm={handleBookingConfirm}

      />

    </SafeAreaView>

  );

}



const detailStyles = StyleSheet.create({

  container: { flex: 1, backgroundColor: '#fff' },

  image: { width: '100%', height: 250 },

  contentContainer: { padding: 20, paddingBottom: 100 }, // Padding for footer

  name: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#111827' },

  detail: { fontSize: 16, color: '#374151', marginBottom: 6, lineHeight: 22 },

  price: { fontSize: 22, fontWeight: 'bold', color: '#059669', marginVertical: 15 },

  section: { marginTop: 20 },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#111827' },

  slotsContainer: {

      flexDirection: 'row',

      flexWrap: 'wrap',

  },

  slot: {

      backgroundColor: '#F3F4F6',

      paddingVertical: 10,

      paddingHorizontal: 15,

      borderRadius: 8,

      marginRight: 10,

      marginBottom: 10,

      borderWidth: 1,

      borderColor: '#E5E7EB',

  },

  selectedSlot: {

      backgroundColor: '#10B981',

      borderColor: '#059669',

  },

  slotText: {

      color: '#1F2937',

      fontWeight: '600',

  },

  selectedSlotText: {

      color: '#fff',

  },

  review: { backgroundColor: '#F9FAFB', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },

  reviewText: { fontStyle: 'italic', fontSize: 15, color: '#374151' },

  reviewAuthor: { textAlign: 'right', marginTop: 8, fontWeight: 'bold', color: '#4B5563' },

  footer: {

      position: 'absolute',

      bottom: 0,

      left: 0,

      right: 0,

      padding: 20,

      backgroundColor: 'white',

      borderTopWidth: 1,

      borderTopColor: '#E5E7EB',

  },

  bookButton: {

      backgroundColor: '#10B981',

      padding: 15,

      borderRadius: 12,

      alignItems: 'center',

  },

  bookButtonText: {

      color: 'white',

      fontSize: 18,

      fontWeight: 'bold',

  }

});





/*

================================================================================

Root App Component

================================================================================

*/

const Stack = createNativeStackNavigator();



function App() {

  return (

    <NavigationContainer>

      <Stack.Navigator

        screenOptions={{

          headerStyle: { backgroundColor: '#10B981' },

          headerTintColor: '#fff',

          headerTitleStyle: { fontWeight: 'bold' },

          headerBackTitleVisible: false,

        }}

      >

        <Stack.Screen 

          name="Home" 

          component={HomeScreen} 

          options={{ title: 'TURF LOCATOR' }} 

        />

        <Stack.Screen 

          name="TurfDetail" 

          component={TurfDetailScreen} 

          options={({ route }) => {

              // Find the turf name from mock data to set as title

              const turf = MOCK_TURFS.find(t => t.id === route.params.turfId);

              return { title: turf ? turf.name : 'Turf Details' };

          }}

        />

      </Stack.Navigator>

    </NavigationContainer>

  );

}



export default App;