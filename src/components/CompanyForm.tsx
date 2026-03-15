import { useState } from 'react'
import { searchCompany } from '../api/searchCompany';

export function CompanyForm() {
  const [company, setCompany] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;

    setLoading(true);
    setError('');
    setEmails([]);
    setSearched(false);

    try {
      const result = await searchCompany(company);
      setEmails(result.emails || []);
      setSearched(true);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <h2 className="text-2xl font-semibold mb-4 text-black">
        Find opportunities for your next company
      </h2>

      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-black/80 mb-2" htmlFor="company">
          Company name
        </label>
        <input
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Stripe, Notion, Figma"
          disabled={loading}
          className="w-full rounded-xl border border-black/20 bg-white/80 px-4 py-3 text-base shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading || !company.trim()}
          className="mt-3 w-full rounded-xl bg-black px-4 py-3 text-white font-medium hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Searching...' : 'Find Emails'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      )}

      {/* Results */}
      {searched && (
        <div className="mt-6">
          {emails.length > 0 ? (
            <>
              <h3 className="text-sm font-semibold text-black/70 mb-3">
                Found {emails.length} HR email{emails.length > 1 ? 's' : ''} for{' '}
                <span className="text-black">{company}</span>
              </h3>
              <ul className="space-y-2">
                {emails.map((email) => (
                  <li
                    key={email}
                    className="flex items-center justify-between rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-sm"
                  >
                    <span className="text-black">{email}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(email)}
                      className="ml-4 text-xs text-sky-500 hover:text-sky-700 font-medium"
                    >
                      Copy
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-black/60 mt-4">
              No HR emails found for <span className="font-medium">{company}</span>. Try a different company name.
            </p>
          )}
        </div>
      )}
    </div>
  )
}