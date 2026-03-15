import { useState } from 'react'

export function CompanyForm() {
  const [company, setCompany] = useState('')

  return (
    <div className="w-full max-w-xl">
      <h2 className="text-2xl font-semibold mb-4 text-black">Find opportunities for your next company</h2>
      <label className="block text-sm font-medium text-black/80 mb-2" htmlFor="company">
        Company name
      </label>
      <input
        id="company"
        value={company}
        onChange={(event) => setCompany(event.target.value)}
        placeholder="Enter a company name"
        className="w-full rounded-xl border border-black/20 bg-white/80 px-4 py-3 text-base shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-sky-300"
      />
      <p className="mt-3 text-sm text-black/70">
        Start typing to see suggestions (this is a placeholder input for now).
      </p>
    </div>
  )
}
