module.exports = {
  includes: {
    alert: false,
    demo: true,
    instance: false,
    console: false,
  },
  portalName: 'API Suite Portal',
  clientName: 'API Suite',
  infra: {
    hydra: 'hydraauth.apisuite.io',
    sandbox: 'sandbox.apisuite.io',
    remoteAPI: 'remoteAPI',
  },
  social: {
    web: 'https://apisuite.io/',
    twitter: 'https://twitter.com/theapisuite',
    github: 'https://github.com/APISuite',
  },
  footer: {
    copyright: '© APISuite 2021.\nAll rights reserved.\nProudly made in Europe.',
  },
  i18n: [
    {
      locale: 'en-US',
      label: 'We speak English',
    },
    {
      locale: 'pt-PT',
      label: 'Nós falamos Português',
    },
  ],
  palette: {
    background: {
      default: '#FFFFFF',
    },
    primary: '#32C896',
    primaryContrastText: '#FFFFFF',
    secondary: '#19B3EE',
    secondaryContrastText: '#FFFFFF',
    tertiary: '#14283C',
    tertiaryContrastText: '#FFFFFF',
    active: '#51606E',
    error: '#FF1515',
    focus: '#19B3EE',
    info: '#19B3EE',
    label: '#BAC0C6',
    success: '#14DE2D',
    warning: '#F78E27',
    greyScales: {
      50: '#EEEEEE',
      100: '#E3E3E3',
      300: '#D1D1D1',
      400: '#ACACAC',
      500: '#8B8B8B',
      600: '#646464',
      700: '#646464',
      800: '#515151',
      900: '#131313',
    },
    newGreyScales: {
      25: '#F7F8F9',
      50: '#ECEDEF',
      100: '#DBDEE1',
      300: '#BAC0C6',
      400: '#85909A',
      500: '#6A7783',
      700: '#374858',
    },
    text: {
      primary: '#333333',
      secondary: '#424242',
    },
    feedback: {
      error: '#FF0000',
    },
    alert: {
      success: {
        background: '#BBECFF',
      },
    },
  },
  dimensions: {
    borderRadius: 4,
  },
  pages: {
    landing: {
      components: [],
    },
  },
}
