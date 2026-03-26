/**
 * Format a funding amount for display.
 * - Values >= 1,000,000 → "$1M", "$2.5M", "$4M"
 * - Values >= 1,000     → "$200K", "$500K"
 * - Values < 1,000      → "$500"
 */
export function formatFunding(amount: number | undefined | null): string {
    if (!amount || amount <= 0) return '$0'

    if (amount >= 1_000_000) {
        const millions = amount / 1_000_000
        // Show decimal only if not a whole number (e.g. $2.5M but not $2.0M)
        return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`
    }

    if (amount >= 1_000) {
        const thousands = amount / 1_000
        return `$${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`
    }

    return `$${amount}`
}
