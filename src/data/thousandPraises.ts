export interface PraiseItem {
  id: number;
  number: number;
  text: string;
  category: string;
}

const praisesData: PraiseItem[] = require('./thousandPraises.json');
export const THOUSAND_PRAISES: PraiseItem[] = praisesData;
