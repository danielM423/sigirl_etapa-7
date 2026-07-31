
import PedidoHistorialForm from '../components/PedidoHistorialForm';
import PedidoHistorialList from '../components/PedidoHistorialList';
import PDFDocumentoForm from '../components/PDFDocumentoForm';
import PDFDocumentoList from '../components/PDFDocumentoList';
import AsistenciaForm from '../components/AsistenciaForm';
import AsistenciaList from '../components/AsistenciaList';
import ListadoDiarioForm from '../components/ListadoDiarioForm';
import ListadoDiarioList from '../components/ListadoDiarioList';

export default function RFsDemo() {
  return (
    <div style={{padding: 24}}>
      <h1>Demo RF-034, RF-039, RF-055/056/057/058</h1>
      <PedidoHistorialForm />
      <PedidoHistorialList />
      <PDFDocumentoForm />
      <PDFDocumentoList />
      <AsistenciaForm />
      <AsistenciaList />
      <ListadoDiarioForm />
      <ListadoDiarioList />
    </div>
  );
}
