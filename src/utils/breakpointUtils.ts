const MOBILE_MAX_WIDTH_PX = 767;

export const isMobile = () => {
  return window.innerWidth <= MOBILE_MAX_WIDTH_PX;
};
