import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bold: {
    fontWeight: 'bold',
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 5,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
  },
  tableCol: {
    flex: 1,
    paddingRight: 5,
  },
  totalSection: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    textAlign: 'center',
  },
});

const InvoicePDF = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>

      {/* Invoice Header */}
      <Text style={styles.header}>INVOICE</Text>

      {/* Order Info */}
      <View style={styles.section}>
        <Text>Order No: <Text style={styles.bold}>{order.order_no}</Text></Text>
        <Text>Order Date: {order.order_date}</Text>
        <Text>Status: {order.status}</Text>
        <Text>Payment: {order.payment_method} ({order.payment_status})</Text>
      </View>

      <View style={styles.divider} />

      {/* Shipping Address */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Shipping Address</Text>
        <Text>{order?.address?.name}</Text>
        <Text>{order?.address?.street_address}</Text>
        <Text>{order?.address?.city}, {order?.address?.state} - {order?.address?.pin_code}</Text>
        <Text>{order?.address?.country}</Text>
        <Text>Phone: {order?.address?.phone_no}</Text>
      </View>

      <View style={styles.divider} />

      {/* Item Table */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Order Items</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableCol, { flex: 2 }]}>Product</Text>
          <Text style={styles.tableCol}>Size</Text>
          <Text style={styles.tableCol}>Color</Text>
          <Text style={styles.tableCol}>Qty</Text>
          <Text style={styles.tableCol}>Price</Text>
          <Text style={styles.tableCol}>Subtotal</Text>
        </View>

        {order?.items?.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 2 }]}>{item.product_name}</Text>
            <Text style={styles.tableCol}>{item.variant.size}</Text>
            <Text style={styles.tableCol}>{item.variant.color}</Text>
            <Text style={styles.tableCol}>{item.quantity}</Text>
            <Text style={styles.tableCol}>₹{item.price}</Text>
            <Text style={styles.tableCol}>₹{(item.quantity * item.price).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalSection}>
        <Text style={styles.totalText}>Total: ₹{order.total}</Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>Thank you for shopping with us!</Text>
    </Page>
  </Document>
);

export default InvoicePDF;


// import React from 'react';
// import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// // Styles
// const styles = StyleSheet.create({
//   page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },

//   title: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },

//   section: { marginBottom: 15 },

//   row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },

//   subtitle: { fontSize: 14, marginBottom: 8, textDecoration: 'underline' },

//   footer: { marginTop: 30, fontSize: 10, textAlign: 'center' },

//   divider: { borderBottomWidth: 1, marginVertical: 10 },

//   bold: { fontWeight: 'bold' },
// });

// // Component
// const InvoicePDF = ({ order }) => (
//   <Document>
//     <Page size="A4" style={styles.page}>
//       {/* Header */}
//       <View style={styles.section}>
//         <Text style={styles.title}>Invoice</Text>
//         <Text>Order Number: {order.order_no}</Text>
//         <Text>Order Date: {order.order_date}</Text>
//         <Text>Status: {order.status}</Text>
//         <Text>Payment Method: {order.payment_method}</Text>
//         <Text>Payment Status: {order.payment_status}</Text>
//       </View>

//       <View style={styles.divider} />

//       {/* Shipping Address */}
//       <View style={styles.section}>
//         <Text style={styles.subtitle}>Shipping Address</Text>
//         <Text>{order.address.name}</Text>
//         <Text>{order.address.street_address}</Text>
//         <Text>{order.address.city}, {order.address.state} - {order.address.pin_code}</Text>
//         <Text>{order.address.country}</Text>
//         <Text>Phone: {order.address.phone_no}</Text>
//       </View>

//       <View style={styles.divider} />

//       {/* Items */}
//       <View style={styles.section}>
//         <Text style={styles.subtitle}>Order Items</Text>
//         {order.items.map((item, index) => (
//           <View key={index} style={{ marginBottom: 8 }}>
//             <Text>Product: {item.product_name}</Text>
//             <Text>Size: {item.variant.size}, Color: {item.variant.color}</Text>
//             <Text>Quantity: {item.quantity}</Text>
//             <Text>Price: ₹{item.price}</Text>
//             <Text style={styles.bold}>Subtotal: ₹{item.price * item.quantity}</Text>
//           </View>
//         ))}
//       </View>

//       <View style={styles.divider} />

//       {/* Total */}
//       <View style={styles.section}>
//         <Text style={styles.subtitle}>Total Amount</Text>
//         <Text style={{ fontSize: 14, fontWeight: 'bold' }}>₹{order.total}</Text>
//       </View>

//       {/* Footer */}
//       <Text style={styles.footer}>Thank you for shopping with us!</Text>
//     </Page>
//   </Document>
// );

// export default InvoicePDF;
