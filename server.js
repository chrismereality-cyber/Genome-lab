import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({ origin: '*' }));
app.use(express.json());

let state = {
  balance: 2557031.10,
  vault_balance: 150000,
  active_position: { size: 0, entry: 0, leverage: 1, side: null },
  history: [],
  market_price: 2500.00
};

const getPnL = () => {
  if (!state.active_position.side) return 0;
  const diff = (state.market_price - state.active_position.entry) / state.active_position.entry;
  let pnl = state.active_position.size * state.active_position.leverage * diff;
  return state.active_position.side === 'SHORT' ? -pnl : pnl;
};

// Market Engine
setInterval(() => {
  state.market_price *= (1 + (Math.random() - 0.5) * 0.0006);
}, 2000);

// NEW: Root route for easy health checking
app.get('/', (req, res) => {
  res.send("TITAN_CORE_V25_ONLINE");
});

// Explicit Pulse route
app.get('/pulse', (req, res) => {
  const pnl = getPnL();
  res.json({
    ...state,
    total_equity: state.balance + pnl,
    unrealized_pnl: pnl,
    market_price: state.market_price.toFixed(2)
  });
});

app.post('/trade', (req, res) => {
  const { size, leverage, side, action } = req.body;
  if (action === 'CLOSE') {
    state.balance += getPnL();
    state.active_position = { size: 0, entry: 0, leverage: 1, side: null };
  } else {
    state.active_position = { size: parseFloat(size), leverage: parseFloat(leverage), entry: state.market_price, side };
  }
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => console.log(`TITAN_V25_STABLE_READY`));
