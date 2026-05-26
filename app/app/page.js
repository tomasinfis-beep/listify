'use client';
import { useState, useRef } from 'react';

export default function Home() {
  const [images, setImages] = useState([]);
  const [platforms, setPlatforms] = useState(['Vinted', 'Wallapop']);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const fileRef = useRef();

  const allPlatforms = ['Vinted', 'Wallapop', 'Depop', 'eBay'];

  function handleFiles(files) {
    Array.from(files).slice(0, 10 - images.length).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        setImages(prev => [...prev, { id: Math.random(), data: e.target.result, file }]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(id) {
    setImages(prev => prev.filter(i => i.id !== id));
  }

  function togglePlatform(p) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  async function generate() {
    if (!images.length || !platforms.length) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const imgs = images.slice(0, 4).map(img => ({
        data: img.data.split(',')[1],
        type: img.file.type || 'image/jpeg'
      }));
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imgs, platforms })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResults(data.listings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyListing(listing, idx) {
    const text = `${listing.title}\n\n${listing.description}\n\nPrice: ${listing.price}\nCondition: ${listing.condition}\n\nTags: ${listing.tags.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>List<span style={{ color: '#D85A30' }}>ify</span></h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Upload photos → get perfect listings for every platform instantly</p>

      <div
        onClick={() => fileRef.current.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        style={{ border: '2px dashed #ddd', borderRadius: 12, padding: '2.5rem', textAlign: 'center', cursor: 'pointer', background: '#fafafa', marginBottom: 16 }}
      >
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} style={{ display: 'none' }} />
        <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Drop your photos here</div>
        <div style={{ color: '#888', fontSize: 14 }}>Upload up to 10 images of the item you want to sell</div>
      </div>

      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8, marginBottom: 16 }}>
          {images.map(img => (
            <div key={img.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid #eee' }}>
              <img src={img.data} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => removeImage(img.id)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#444' }}>Generate listings for</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {allPlatforms.map(p => (
          <button key={p} onClick={() => togglePlatform(p)} style={{ padding: '6px 16px', borderRadius: 20, border: '1px solid', borderColor: platforms.includes(p) ? '#D85A30' : '#ddd', background: platforms.includes(p) ? '#D85A30' : 'white', color: platforms.includes(p) ? 'white' : '#666', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            {p}
          </button>
        ))}
      </div>

      <button onClick={generate} disabled={loading || !images.length || !platforms.length} style={{ width: '100%', padding: '14px', background: '#D85A30', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer', opacity: (loading || !images.length || !platforms.length) ? 0.5 : 1 }}>
        {loading ? '✨ Analysing your item...' : '✨ Generate listings'}
      </button>

      {error && <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff0f0', color: '#c00', borderRadius: 8, fontSize: 14 }}>{error}</div>}

      {results.length > 0 && (
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {results.map((listing, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>🏷 {listing.platform}</span>
                <button onClick={() => copyListing(listing, idx)} style={{ padding: '5px 12px', border: '1px solid #ddd', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, color: copied === idx ? '#1D9E75' : '#666' }}>
                  {copied === idx ? '✓ Copied!' : 'Copy listing'}
                </button>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Title</div>
                <div style={{ marginBottom: 14, fontWeight: 500 }}>{listing.title}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Description</div>
                <div style={{ marginBottom: 14, lineHeight: 1.6, color: '#333' }}>{listing.description}</div>
                <div style={{ display: 'flex', gap: 32, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Price</div>
                    <span style={{ background: '#EAF3DE', color: '#3B6D11', padding: '4px 12px', borderRadius: 20, fontWeight: 600, fontSize: 14 }}>{listing.price}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Condition</div>
                    <div style={{ fontWeight: 500 }}>{listing.condition}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Tags</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {listing.tags.map((tag, i) => (
                    <span key={i} style={{ background: '#f5f5f5', color: '#555', padding: '3px 10px', borderRadius: 20, fontSize: 12, border: '1px solid #eee' }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
