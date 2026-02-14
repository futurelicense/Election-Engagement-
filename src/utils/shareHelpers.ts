import { Candidate, Country } from './types';
export function generateShareText(candidate: Candidate, country: Country): string {
  return `I just voted for ${candidate.name} in the ${country.name} Election 2025! Make your voice heard and vote today! 🗳️`;
}
export function generateShareUrl(countryId: string): string {
  return `${window.location.origin}/election/${countryId}`;
}