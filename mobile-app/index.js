import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';

function Main() {
    return (
        <PaperProvider theme={MD3DarkTheme}>
            <App />
        </PaperProvider>
    )
}

AppRegistry.registerComponent(appName, () => Main);
