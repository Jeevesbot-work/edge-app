export default function PendingPage() {
  return (
    <div className="min-h-screen bg-edge-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-edge-gold/20 flex items-center justify-center mx-auto">
          <span className="font-condensed font-black text-2xl text-edge-gold">E</span>
        </div>
        <h1 className="font-condensed font-black text-3xl uppercase tracking-wide">
          Application submitted.
        </h1>
        <p className="text-white/70 font-body leading-relaxed">
          Nick reviews every application personally. He'll be in touch via WhatsApp within 24 hours.
        </p>
        <p className="text-edge-muted text-sm font-body">
          Once approved, you'll receive an email with your access link.
        </p>
        <div className="bg-edge-surface rounded-xl p-4 text-left">
          <p className="text-edge-gold font-condensed font-bold uppercase tracking-wide text-sm mb-1">
            What happens next
          </p>
          <ol className="text-white/70 text-sm font-body space-y-1 list-decimal list-inside">
            <li>Nick reviews your application</li>
            <li>Personal WhatsApp message from Nick</li>
            <li>Payment processed</li>
            <li>Full access unlocked</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
