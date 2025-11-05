import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Onboarding1 from './screens/Onboarding1';
import Onboarding2 from './screens/Onboarding2';
import Onboarding3 from './screens/Onboarding3';
import Login from './screens/Login';
import Cadastro from './screens/Cadastro';
import SelecaoEstilos from './screens/SelecaoEstilos';
import GuardaRoupa from './screens/GuardaRoupa';
import Perfil from './screens/Perfil';
import EditarPerfil from './screens/EditarPerfil';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding1" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding1" component={Onboarding1} />
        <Stack.Screen name="Onboarding2" component={Onboarding2} />
        <Stack.Screen name="Onboarding3" component={Onboarding3} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: true }} />
        <Stack.Screen name="Cadastro" component={Cadastro} options={{ headerShown: true }} />
        <Stack.Screen name="SelecaoEstilos" component={SelecaoEstilos} options={{ headerShown: true }} />
        <Stack.Screen name="GuardaRoupa" component={GuardaRoupa} options={{ headerShown: true }} />
        <Stack.Screen name="Perfil" component={Perfil} options={{ headerShown: true }} />
        <Stack.Screen name="EditarPerfil" component={EditarPerfil}  />
      </Stack.Navigator>
    </NavigationContainer>
  );
}