import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import Layout from '../components/Layout'
import './PurchaseHistory.css'

type Purchase = {
  id: number
  date: string
  buyer: string
  email: string
  image: string
  collection: string
  amount: number
}

const samplePurchases: Purchase[] = [
  {
    id: 1,
    date: '2026-10-24',
    buyer: 'Olivia Bennett',
    email: 'olivia.bennett@example.com',
    image: 'Golden Hour',
    collection: 'Landscapes',
    amount: 85.0,
  },
  {
    id: 2,
    date: '2026-10-21',
    buyer: 'James Wilson',
    email: 'james.wilson@example.com',
    image: 'Quiet Streets',
    collection: 'Street Photography',
    amount: 120.0,
  },
  {
    id: 3,
    date: '2026-10-18',
    buyer: 'Sophia Chen',
    email: 'sophia.chen@example.com',
    image: 'Morning Light',
    collection: 'Portraits',
    amount: 95.0,
  },
  {
    id: 4,
    date: '2026-10-12',
    buyer: 'Ethan Parker',
    email: 'ethan.parker@example.com',
    image: 'Still Waters',
    collection: 'Landscapes',
    amount: 150.0,
  },
  {
    id: 5,
    date: '2026-10-08',
    buyer: 'Isabella Martinez',
    email: 'isabella.martinez@example.com',
    image: 'City After Dark',
    collection: 'Street Photography',
    amount: 110.0,
  },
  {
    id: 6,
    date: '2026-09-29',
    buyer: 'Noah Thompson',
    email: 'noah.thompson@example.com',
    image: 'Coastal Morning',
    collection: 'Landscapes',
    amount: 75.0,
  },
]

export default function PurchaseHistoryPage() {
  const [dateFilter, setDateFilter] = useState('')

  // Filter purchases by selected date
  const filteredPurchases = samplePurchases.filter((purchase) => {
    if (!dateFilter) return true

    return purchase.date === dateFilter
  })

  // Calculate statistics based on filtered purchases
  const imagesSold = filteredPurchases.length

  const totalSales = filteredPurchases.reduce(
    (total, purchase) => total + purchase.amount,
    0
  )

  // Format currency
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)
  }

  // Format dates
  function formatDate(date: string) {
    const [year, month, day] = date.split('-').map(Number)

    return new Date(year, month - 1, day).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Layout>
      <section className="purchase-history-page">

        {/* Back navigation */}
        <Link to="/purchasing" className="purchase-history-back">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>BACK TO IMAGES FOR PURCHASE</span>
        </Link>

        {/* Page heading */}
        <header className="purchase-history-header">
          <h1>Sales History</h1>
        </header>

        {/* Sales overview */}
        <div className="purchase-history-summary">

          <div className="purchase-history-stat">
            <span className="purchase-stat-label">
              IMAGES SOLD
            </span>

            <strong className="purchase-stat-value">
              {imagesSold}
            </strong>
          </div>

          <div className="purchase-history-stat">
            <span className="purchase-stat-label">
              TOTAL SALES
            </span>

            <strong className="purchase-stat-value">
              {formatCurrency(totalSales)}
            </strong>
          </div>

        </div>

        {/* Transactions section */}
        <div className="purchase-history-content">

          <div className="purchase-history-toolbar">

            <h2>Transactions</h2>

            <div className="purchase-history-filters">

              <label className="purchase-date-filter">
                <span>FILTER BY DATE</span>

                <input
                  type="date"
                  aria-label="Filter purchases by date"
                  value={dateFilter}
                  onChange={(event) =>
                    setDateFilter(event.target.value)
                  }
                />
              </label>

              {dateFilter && (
                <button
                  type="button"
                  className="purchase-clear-filter"
                  onClick={() => setDateFilter('')}
                >
                  CLEAR
                </button>
              )}

            </div>

          </div>

          {/* Purchase history table */}
          <div className="purchase-history-table-wrap">

            <table className="purchase-history-table">

              <thead>
                <tr>
                  <th scope="col">DATE</th>
                  <th scope="col">BUYER</th>
                  <th scope="col">IMAGE</th>
                  <th scope="col">AMOUNT</th>
                </tr>
              </thead>

              <tbody>

                {filteredPurchases.length > 0 ? (
                  filteredPurchases.map((purchase) => (
                    <tr key={purchase.id}>

                      {/* Date */}
                      <td className="purchase-date">
                        {formatDate(purchase.date)}
                      </td>

                      {/* Buyer */}
                      <td>
                        <div className="purchase-buyer">
                          <span className="purchase-buyer-name">
                            {purchase.buyer}
                          </span>

                          <span className="purchase-buyer-email">
                            {purchase.email}
                          </span>
                        </div>
                      </td>

                      {/* Image */}
                      <td>
                        <div className="purchase-image">
                          <span className="purchase-image-name">
                            {purchase.image}
                          </span>

                          <span className="purchase-image-collection">
                            {purchase.collection}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="purchase-amount">
                        {formatCurrency(purchase.amount)}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="purchase-history-empty"
                    >
                      No purchases found for this date.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

          {/* Transaction count */}
          <div className="purchase-history-footer">
            <span>
              Showing {filteredPurchases.length} of{' '}
              {samplePurchases.length} transactions
            </span>
          </div>

        </div>

      </section>
    </Layout>
  )
}