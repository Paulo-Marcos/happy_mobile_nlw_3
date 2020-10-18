import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  Button,
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  BaseButton,
  BorderlessButton,
  RectButton,
  TextInput,
  TouchableHighlight,
} from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";

import mapMarker from "../images/map-marker.png";

import api from "../services/api";

interface Orphanage {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface Coordenates {
  latitude: number;
  longitude: number;
}

export default function OrphanagesMap() {
  const navigation = useNavigation();

  const [orphanages, setOrphanages] = useState<Orphanage[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [location, setLocation] = useState({ city: "", state: "" });
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [coordinates, setCoordinates] = useState<Coordenates>({
    latitude: -15.6367684,
    longitude: -47.8438988,
  });

  useEffect(() => {
    api.get("orphanages").then((response) => {
      setOrphanages(response.data);
    });
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
      }

      const result = await Location.getCurrentPositionAsync({});

      setCoordinates({
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    api
      .get(`coordenates/${coordinates.latitude}/${coordinates.longitude}`)
      .then((response) => {
        setLocation(response.data);
        setCity(response.data.city);
        setState(response.data.state);
      });
  }, []);

  function handleNavigateToOrphanageDetails(id: number) {
    navigation.navigate("OrphanageDetails", { id });
  }

  function handleNavigateToCreateOrphanage() {
    navigation.navigate("SelectMapPosition");
  }

  function handleModalLocation() {
    setModalVisible(true);
  }

  function handleChangeLocation() {
    setModalVisible(!modalVisible);
    if (!city || !state) return;
    if (city !== location.city || state !== location.state) {
      api.get(`location/${city}/${state}`).then((response) => {
        const result = response.data;
        setLocation({ city: city, state: state });
        setCoordinates({
          latitude: result.latitude,
          longitude: result.longitude,
        });
      });
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        region={{
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {orphanages.map((orphanage) => {
          return (
            <Marker
              key={orphanage.id}
              icon={mapMarker}
              calloutAnchor={{
                x: 2.7,
                y: 0.8,
              }}
              coordinate={{
                latitude: orphanage.latitude,
                longitude: orphanage.longitude,
              }}
            >
              <Callout
                tooltip
                onPress={() => handleNavigateToOrphanageDetails(orphanage.id)}
              >
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutText}>{orphanage.name}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <BorderlessButton
        style={{ ...styles.defineLocation }}
        onPress={handleModalLocation}
      >
        <Feather name="target" size={40} color="#15c3d6"></Feather>
      </BorderlessButton>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {orphanages.length} orfanato(s) encontrado(s)
        </Text>
        <RectButton
          style={styles.createOrphanageButton}
          onPress={handleNavigateToCreateOrphanage}
        >
          <Feather name="plus" size={20} color="#fff"></Feather>
        </RectButton>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={[styles.input, { height: 50, width: 300 }]}
              value={city}
              onChangeText={(text) => setCity(text)}
            />

            <Text style={styles.label}>Estado</Text>
            <TextInput
              style={[styles.input, { height: 50, width: 300 }]}
              value={state}
              onChangeText={(text) => setState(text)}
            />

            <TouchableOpacity
              onPress={handleChangeLocation}
              style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
            >
              <Text style={styles.textStyle}>Ir para a localização</Text>
              <Feather name="search" size={20} color="#fff"></Feather>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },

  calloutContainer: {
    width: 160,
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 16,
    justifyContent: "center",
  },

  calloutText: {
    color: "#0089a5",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
  },

  footer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 32,

    backgroundColor: "#fff",
    borderRadius: 20,
    height: 56,
    paddingLeft: 24,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    elevation: 10,
  },

  footerText: {
    color: "#8fa7b3",
    fontFamily: "Nunito_700Bold",
  },

  createOrphanageButton: {
    width: 56,
    height: 56,
    backgroundColor: "#15c3d6",
    borderRadius: 20,

    justifyContent: "center",
    alignItems: "center",
  },

  defineLocation: {
    width: 40,
    height: 40,

    marginTop: 40,
    marginLeft: 320,

    position: "absolute",
    left: 24,
    right: 24,
    top: 32,

    borderRadius: 20,

    elevation: 10,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    width: 350,
    height: 310,
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    width: 300,
    height: 50,
    backgroundColor: "#F194FF",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1.4,
    borderColor: "#d3e2e6",
    borderRadius: 20,
    height: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    textAlignVertical: "top",
  },

  label: {
    color: "#8fa7b3",
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 8,
  },
});
