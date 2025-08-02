module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/', './assets/images/'],
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: {
          sourceDir: '../node_modules/react-native-vector-icons/Fonts',
          project: './RNVectorIcons.xcodeproj',
        },
        android: {
          sourceDir: '../node_modules/react-native-vector-icons/Fonts',
          packageImportPath: 'import io.github.react-native-vector-icons.VectorIconsPackage;',
        },
      },
    },
  },
};