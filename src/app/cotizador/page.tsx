import React from "react";

export default function CotizadorExternoPage() {
    return (
        <div className="w-full h-screen bg-white flex flex-col">
            {/* EL IFRAME OCUPANDO TODO EL RESTO DE LA PANTALLA */}
            <div className="flex-1 w-full overflow-hidden">
                <iframe
                    src="http://inncome.net/cotizador-iframe"
                    title="Cotizador Innmed"
                    className="w-full h-full border-none"
                    allow="payment" // Por si usás MercadoPago en el otro proyecto
                />
            </div>
        </div>
    );
}
