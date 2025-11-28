import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useCart } from '../context/AppContext';
import Filters from '../components/paquetes/Filters';
import ProductGrid from '../components/paquetes/ProductGrid';

export default function Paquete() {
    const { addToCart } = useCart();
    const [filter, setFilter] = useState('all');
    const [paquetes, setPaquetes] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8081/api/paquetes')
            .then(res => res.json())
            .then(data => setPaquetes(data));
    }, []);

    const list = filter === 'all'
        ? paquetes
        : paquetes.filter(p => p.categoria === filter);

    return (
        <main>
        <Container>
            <h2 className="mb-2">Travel Go</h2>
            <p className="text-muted mb-3">Viajes por todo Chile</p>

            <Filters
            current={filter}
            onChange={setFilter}
            options={["1 a 2 horas", "3 a 8 horas", "13 a 24 horas", "mas de 24 horas"]}
            total={paquetes.length}
            />

            <ProductGrid items={list} onAdd={addToCart} />
        </Container>
        </main>
    );
}