module.exports = {
  portalName: 'API Suite Portal',
  clientName: 'API Suite',
  supportURL: 'https://intercom.help/api-suite/en/articles/4586659-api-portal-users',
  documentationURL: '',
  socialURLs: [],
  i18nOptions: [
    { locale: 'en-US', label: 'We speak English' },
    { locale: 'pt-PT', label: 'Nós falamos Português' },
  ],
  theme: {
    type: 'light',
    common: { black: '#000000', white: '#FFFFFF' },
    primary: { main: '#14283C', dark: '#000017', light: '#374858', contrastText: '#FFFFFF' },
    secondary: { main: '#32C896', dark: '#007C45', light: '#B3E7D1', contrastText: '#14283C' },
    error: { main: '#FF1515', dark: '#840608', light: '#FFA1A1' },
    warning: { main: '#F78E27', dark: '#80460B', light: '#FFDCB9' },
    info: { main: '#19B3EE', dark: '#035E86', light: '#BBECFF' },
    success: { main: '#14DE2D', dark: '#037C17', light: '#A9F19E' },
    gradient: {
      main: 'linear-gradient(270deg, #C8DC8C 0%, #007D7D 100%)',
      dark: 'linear-gradient(270deg, #7DD291 0%, #007D7D 100%)',
      light: 'linear-gradient(270deg, #C8DC8C 0%, #19A38A 100%)',
    },
    grey: {
      50: '#F7F8F9',
      100: '#ECEDEF',
      200: '#DBDEE1',
      300: '#BAC0C6',
      400: '#85909A',
      500: '#6A7783',
      600: '#646464',
      700: '#535E68',
      800: '#515151',
      900: '#131313',
    },
    text: {
      primary: '#14283C',
      secondary: '#85909A',
      disabled: '#DBDEE1',
      hint: '#51606E',
    },
    divider: '#DBDEE1',
    action: {
      active: '#51606E',
      hover: 'rgba(0,0,0,0.04)',
      selected: 'rgba(0,0,0,0.08)',
      disabled: '#DBDEE1',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
      focus: '#19B3EE',
    },
    background: {
      default: '#F7F8F9',
      paper: '#FFFFFF',
    },
    label: '#BAC0C6',
    dimensions: {
      borderRadius: 4,
    },
  },
  infra: {
    hydra: 'hydraauth.develop.apisuite.io',
    sandbox: 'sandbox.develop.apisuite.io',
    remoteAPI: 'remoteAPI',
  },
  pages: {
    landing: {
      components: [],
    },
  },
}
