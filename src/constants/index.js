const devices = [
  {
    name: '20"',
    aspectRatio: 1.8,
    num: 9,
    dem: 5,
    width: 1500,
    type: 'desktop',
  }, // width rough guess
  {
    name: '10"',
    aspectRatio: 1.71,
    num: 171,
    dem: 100,
    width: 1024,
    type: 'laptop',
  },
  {
    name: '24"',
    aspectRatio: 1.6,
    num: 8,
    dem: 5,
    width: 1920,
    type: 'desktop',
  },
  {
    name: '12"',
    aspectRatio: 1.4,
    num: 7,
    dem: 5,
    width: 1100,
    type: 'laptop',
  }, // width rough guess
  {
    name: 'iPad"',
    aspectRatio: 0.75,
    num: 3,
    dem: 4,
    width: 768,
    type: 'tablet',
  },
  {
    name: 'Windows',
    aspectRatio: 0.6,
    num: 3,
    dem: 5,
    width: 420,
    type: 'mobile',
  }, // width rough guess
  {
    name: 'iPhone +',
    aspectRatio: 0.57,
    num: 57,
    dem: 100,
    width: 414,
    type: 'mobile',
  },
  {
    name: 'iPhone X',
    aspectRatio: 0.47,
    num: 47,
    dem: 100,
    width: 375,
    type: 'mobile',
  },
];

const defaultProductValues = {
  addToCartButton: {
    positions: [{ aspectRatio: 1.8, x: 70, y: 72 }],
    fontSizes: [{ aspectRatio: 1.8, value: 20 }],
    fontWeights: [{ aspectRatio: 1.8, value: 400 }],
  },
  productDiscount: {
    positions: [{ aspectRatio: 1.8, x: 80, y: 40 }],
    fontSizes: [{ aspectRatio: 1.8, value: 20 }],
    fontWeights: [{ aspectRatio: 1.8, value: 400 }],
  },
  productViewDescription: {
    positions: [{ aspectRatio: 1.8, x: 62, y: 24 }],
    widths: [{ aspectRatio: 1.8, value: 20 }],
    fontSizes: [{ aspectRatio: 1.8, value: 16 }],
    fontWeights: [{ aspectRatio: 1.8, value: 400 }],
  },
  productViewPrice: {
    positions: [{ aspectRatio: 1.8, x: 70, y: 60 }],
    fontSizes: [{ aspectRatio: 1.8, value: 20 }],
    fontWeights: [{ aspectRatio: 1.8, value: 400 }],
  },
  productViewTitle: {
    positions: [{ aspectRatio: 1.8, x: 70, y: 15 }],
    fontSizes: [{ aspectRatio: 1.8, value: 20 }],
    fontWeights: [{ aspectRatio: 1.8, value: 400 }],
  },
  textAlignmentPosition: [{ aspectRatio: 1.8, value: 60 }],
};

export { devices, defaultProductValues };
