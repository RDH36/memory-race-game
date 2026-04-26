// paywall-app.jsx — Renders a design_canvas with 9 artboards:
// 3 versions × 3 packs (Premium / Ange / Démon).
// Each artboard is an Android phone showing the dimmed shop with the
// paywall bottom-sheet overlaid.

const { DesignCanvas, DCSection, DCArtboard } = window;

function PaywallShowcase() {
  return (
    <DesignCanvas
      title="Flipia — Paywall Bottom Sheets"
      subtitle="Écran d'achat sur app/pack/[id] · 3 directions × 3 packs"
    >
      <DCSection
        id="v1"
        title="V1 — Classic Sheet"
        subtitle="Hero coloré en haut, loot card blanc, CTA sticky — proche du pattern actuel"
      >
        <DCArtboard id="v1-premium" label="Premium" width={400} height={760}>
          <div style={{ width: 400, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEE8EA' }}>
            <PhoneStage sheetHeight={620}>
              <PaywallV1 pack="premium" />
            </PhoneStage>
          </div>
        </DCArtboard>
        <DCArtboard id="v1-angel" label="Pack Ange" width={400} height={760}>
          <div style={{ width: 400, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEE8EA' }}>
            <PhoneStage sheetHeight={620}>
              <PaywallV1 pack="angel" />
            </PhoneStage>
          </div>
        </DCArtboard>
        <DCArtboard id="v1-demon" label="Pack Démon" width={400} height={760}>
          <div style={{ width: 400, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEE8EA' }}>
            <PhoneStage sheetHeight={620}>
              <PaywallV1 pack="demon" />
            </PhoneStage>
          </div>
        </DCArtboard>
      </DCSection>

      <DCSection
        id="v2"
        title="V2 — Immersive Reveal"
        subtitle="Full-bleed atmosphère du pack, plateau en héros, CTA flottante"
      >
        <DCArtboard id="v2-premium" label="Premium" width={400} height={760}>
          <div style={{ width: 400, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEE8EA' }}>
            <PhoneStage sheetHeight={660}>
              <PaywallV2 pack="premium" />
            </PhoneStage>
          </div>
        </DCArtboard>
        <DCArtboard id="v2-angel" label="Pack Ange" width={400} height={760}>
          <div style={{ width: 400, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEE8EA' }}>
            <PhoneStage sheetHeight={660}>
              <PaywallV2 pack="angel" />
            </PhoneStage>
          </div>
        </DCArtboard>
        <DCArtboard id="v2-demon" label="Pack Démon" width={400} height={760}>
          <div style={{ width: 400, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEE8EA' }}>
            <PhoneStage sheetHeight={660}>
              <PaywallV2 pack="demon" />
            </PhoneStage>
          </div>
        </DCArtboard>
      </DCSection>

      <DCSection
        id="v3"
        title="V3 — Loot Card"
        subtitle="Bandeau couleur + cartes loot 'tu obtiens exactement ça' + CTA avec prix"
      >
        <DCArtboard id="v3-premium" label="Premium" width={400} height={760}>
          <div style={{ width: 400, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEE8EA' }}>
            <PhoneStage sheetHeight={640}>
              <PaywallV3 pack="premium" />
            </PhoneStage>
          </div>
        </DCArtboard>
        <DCArtboard id="v3-angel" label="Pack Ange" width={400} height={760}>
          <div style={{ width: 400, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEE8EA' }}>
            <PhoneStage sheetHeight={600}>
              <PaywallV3 pack="angel" />
            </PhoneStage>
          </div>
        </DCArtboard>
        <DCArtboard id="v3-demon" label="Pack Démon" width={400} height={760}>
          <div style={{ width: 400, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEE8EA' }}>
            <PhoneStage sheetHeight={600}>
              <PaywallV3 pack="demon" />
            </PhoneStage>
          </div>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<PaywallShowcase />);
