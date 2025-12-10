interface WardrobeItem {
  id: string
  name: string
  category: string
  price: number
  wear_count: number
  purchase_date?: string
  color?: string
  brand?: string
  condition?: string
}

export function exportToCSV(items: WardrobeItem[], filename: string = "wardrobe-analytics.csv") {
  // Define CSV headers
  const headers = [
    "Name",
    "Category",
    "Price",
    "Wear Count",
    "Cost Per Wear",
    "Purchase Date",
    "Color",
    "Brand",
    "Condition"
  ]

  // Convert items to CSV rows
  const rows = items.map(item => {
    const cpw = item.wear_count > 0 ? (item.price / item.wear_count).toFixed(2) : item.price.toFixed(2)
    return [
      `"${item.name}"`,
      `"${item.category}"`,
      item.price.toFixed(2),
      item.wear_count || 0,
      cpw,
      item.purchase_date || "N/A",
      item.color || "N/A",
      item.brand || "N/A",
      item.condition || "N/A"
    ].join(",")
  })

  // Combine headers and rows
  const csv = [headers.join(","), ...rows].join("\n")

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToPDF(items: WardrobeItem[], analytics: any, filename: string = "wardrobe-analytics.pdf") {
  // Calculate summary statistics
  const totalItems = items.length
  const totalSpent = items.reduce((sum, item) => sum + (item.price || 0), 0)
  const totalWears = items.reduce((sum, item) => sum + (item.wear_count || 0), 0)
  const avgCPW = totalWears > 0 ? totalSpent / totalWears : 0
  const unwornItems = items.filter(item => (item.wear_count || 0) === 0).length

  // Get best value items
  const wornItems = items
    .filter(item => (item.wear_count || 0) > 0)
    .map(item => ({
      ...item,
      cpw: item.price / (item.wear_count || 1)
    }))
    .sort((a, b) => a.cpw - b.cpw)
    .slice(0, 5)

  // Create HTML content for PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #1e293b;
      background: white;
    }
    h1 {
      color: #0f172a;
      border-bottom: 3px solid #10b981;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      color: #334155;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
    }
    .summary-card h3 {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 8px 0;
      font-weight: 500;
    }
    .summary-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #0f172a;
      margin: 0;
    }
    .summary-card .label {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      background: white;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 600;
      text-align: left;
      padding: 12px;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
    }
    tr:hover {
      background: #f8fafc;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }
    .highlight {
      color: #10b981;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <h1>📊 Wardrobe Analytics Report</h1>
  <p style="color: #64748b; margin-bottom: 30px;">Generated on ${new Date().toLocaleDateString()}</p>

  <h2>Summary</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <h3>Total Items</h3>
      <p class="value">${totalItems}</p>
      <p class="label">In your wardrobe</p>
    </div>
    <div class="summary-card">
      <h3>Total Spent</h3>
      <p class="value">$${totalSpent.toFixed(0)}</p>
      <p class="label">On all items</p>
    </div>
    <div class="summary-card">
      <h3>Unworn Items</h3>
      <p class="value">${unwornItems}</p>
      <p class="label">${((unwornItems / totalItems) * 100).toFixed(0)}% of wardrobe</p>
    </div>
    <div class="summary-card">
      <h3>Avg Cost/Wear</h3>
      <p class="value">$${avgCPW.toFixed(2)}</p>
      <p class="label">Per wear</p>
    </div>
  </div>

  <h2>Best Value Items</h2>
  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Item</th>
        <th>Category</th>
        <th>Wears</th>
        <th>Cost/Wear</th>
      </tr>
    </thead>
    <tbody>
      ${wornItems.map((item, index) => `
        <tr>
          <td><span class="highlight">#${index + 1}</span></td>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>${item.wear_count}</td>
          <td class="highlight">$${item.cpw.toFixed(2)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="footer">
    <p>Weather Smart - AI Outfit Assistant</p>
    <p>This report is generated from your wardrobe data</p>
  </div>
</body>
</html>
  `

  // Create a new window and print
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}
