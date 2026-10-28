import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import Layout from '../components/Layout'
import './Purchasing.css'

export default function PurchaseHistoryPage() {
  const [dateFilter, setDateFilter] = useState('')

  return (
    <Layout>
      <section className="purchase-history-page">
        <header className="purchase-history-header">
          <div className="purchase-history-heading">
            <Link
              to="/purchasing"
              className="purchase-history-back"
              aria-label="Back to available for purchase"
              title="Back to available for purchase"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </Link>
            <h1>Purchase history</h1>
          </div>

          <div className="purchase-history-summary">
            <div className="purchase-history-stat">
              <span>Images sold</span>
              <strong>0</strong>
            </div>
            <div className="purchase-history-stat">
              <span>Total sales</span>
              <strong>$0.00</strong>
            </div>
            <label className="purchase-date-filter">
              <span>Date filter</span>
              <input
                type="date"
                aria-label="Filter purchases by date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              />
            </label>
          </div>
        </header>

        <div className="purchase-history-table-wrap">
          <table className="purchase-history-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Buyer</th>
                <th scope="col">Image</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="purchase-history-empty">
                  No purchases yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  )
}
