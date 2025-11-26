import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Keyboard, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    if (!city.trim()) return;

    // Fecha o teclado ao iniciar a busca
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      // 1. Geocodificação (Nome -> Lat/Lon)
      // Usando API gratuita Open-Meteo Geocoding
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('Cidade não encontrada.');
      }

      const { latitude, longitude, name, admin1, country_code } = geoData.results[0];

      // 2. Previsão do Tempo (Lat/Lon -> Dados)
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
      );
      const weatherDataResult = await weatherResponse.json();

      setWeatherData({
        city: name,
        region: admin1,
        country: country_code,
        temp: Math.round(weatherDataResult.current.temperature_2m),
        code: weatherDataResult.current.weather_code,
      });

    } catch (err) {
      setError(err.message || 'Erro ao buscar dados.');
    } finally {
      setLoading(false);
    }
  };

  // Função para mapear códigos WMO para ícones do MaterialCommunityIcons
  const getWeatherDetails = (code) => {
    if (code === 0) return { icon: 'weather-sunny', label: 'Céu Limpo', color: '#FDB813' };
    if (code >= 1 && code <= 3) return { icon: 'weather-partly-cloudy', label: 'Parcialmente Nublado', color: '#A0A0A0' };
    if (code >= 45 && code <= 48) return { icon: 'weather-fog', label: 'Nevoeiro', color: '#787878' };
    if (code >= 51 && code <= 67) return { icon: 'weather-rainy', label: 'Chuva', color: '#4299E1' };
    if (code >= 71 && code <= 77) return { icon: 'weather-snowy', label: 'Neve', color: '#90CDF4' };
    if (code >= 80 && code <= 82) return { icon: 'weather-pouring', label: 'Pancadas de Chuva', color: '#2B6CB0' };
    if (code >= 95 && code <= 99) return { icon: 'weather-lightning', label: 'Tempestade', color: '#805AD5' };
    
    return { icon: 'weather-sunny', label: 'Céu Limpo', color: '#FDB813' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Previsão do Tempo</Text>
      </View>

      <View style={styles.content}>
        {/* Input e Botão */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome da cidade"
            value={city}
            onChangeText={setCity}
            onSubmitEditing={fetchWeather}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.button} 
            onPress={fetchWeather}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <MaterialCommunityIcons name="magnify" size={24} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Mensagem de Erro */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Resultado */}
        {weatherData && (
          <View style={styles.resultCard}>
            
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
              <Text style={styles.locationText}>
                {weatherData.city}, {weatherData.country}
              </Text>
            </View>

            <View style={styles.weatherIconContainer}>
              <MaterialCommunityIcons 
                name={getWeatherDetails(weatherData.code).icon} 
                size={100} 
                color={getWeatherDetails(weatherData.code).color} 
              />
            </View>

            <Text style={styles.temperature}>
              {weatherData.temp}°C
            </Text>

            <Text style={styles.description}>
              {getWeatherDetails(weatherData.code).label}
            </Text>

          </View>
        )}
        
        {!weatherData && !loading && (
          <View style={styles.placeholderContainer}>
            <MaterialCommunityIcons name="cloud-search-outline" size={60} color="#DDD" />
            <Text style={styles.placeholderText}>Busque por uma cidade para ver a previsão</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#2563EB',
    padding: 20,
    paddingTop: 40, // Ajuste para StatusBar em alguns devices
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    backgroundColor: '#F97316', // Laranja
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 4,
  },
  weatherIconContainer: {
    marginBottom: 20,
  },
  temperature: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  description: {
    fontSize: 20,
    color: '#6B7280',
    textTransform: 'capitalize',
    marginTop: 5,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
    marginTop: 40,
  },
  placeholderText: {
    marginTop: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 16,
  },
});