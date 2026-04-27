import yfinance as yf
import pandas as pd
import os

SAVE_DIR = '/home/z/my-project/download/graficos_trading'

# Download NVDA data - multiple timeframes
print("Downloading NVDA data...")
nvda_1d = yf.download('NVDA', period='6mo', interval='1d')
nvda_1h = yf.download('NVDA', period='60d', interval='1h')
nvda_5m = yf.download('NVDA', period='5d', interval='5m')
nvda_1m = yf.download('NVDA', period='1d', interval='1m')

nvda_1d.to_csv(f'{SAVE_DIR}/nvda_1d.csv')
nvda_1h.to_csv(f'{SAVE_DIR}/nvda_1h.csv')
nvda_5m.to_csv(f'{SAVE_DIR}/nvda_5m.csv')
nvda_1m.to_csv(f'{SAVE_DIR}/nvda_1m.csv')

print(f"NVDA 1D: {len(nvda_1d)} candles")
print(f"NVDA 1H: {len(nvda_1h)} candles")
print(f"NVDA 5M: {len(nvda_5m)} candles")
print(f"NVDA 1M: {len(nvda_1m)} candles")

# Download TSLA data
print("\nDownloading TSLA data...")
tsla_1d = yf.download('TSLA', period='6mo', interval='1d')
tsla_1h = yf.download('TSLA', period='60d', interval='1h')
tsla_5m = yf.download('TSLA', period='5d', interval='5m')
tsla_1m = yf.download('TSLA', period='1d', interval='1m')

tsla_1d.to_csv(f'{SAVE_DIR}/tsla_1d.csv')
tsla_1h.to_csv(f'{SAVE_DIR}/tsla_1h.csv')
tsla_5m.to_csv(f'{SAVE_DIR}/tsla_5m.csv')
tsla_1m.to_csv(f'{SAVE_DIR}/tsla_1m.csv')

print(f"TSLA 1D: {len(tsla_1d)} candles")
print(f"TSLA 1H: {len(tsla_1h)} candles")
print(f"TSLA 5M: {len(tsla_5m)} candles")
print(f"TSLA 1M: {len(tsla_1m)} candles")

# Download QQQ and VIX
print("\nDownloading QQQ and VIX...")
qqq = yf.download('QQQ', period='6mo', interval='1d')
vix = yf.download('^VIX', period='6mo', interval='1d')
qqq.to_csv(f'{SAVE_DIR}/qqq_1d.csv')
vix.to_csv(f'{SAVE_DIR}/vix_1d.csv')

print("All data downloaded successfully!")
