import { Novu } from "@novu/node";

let _novu: Novu | null = null;

export function getNovu(): Novu | null {
  if (!process.env.NOVU_API_KEY) return null;
  if (!_novu) {
    _novu = new Novu(process.env.NOVU_API_KEY);
  }
  return _novu;
}
