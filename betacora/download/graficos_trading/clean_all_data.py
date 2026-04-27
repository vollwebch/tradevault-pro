import pandas as pd

SAVE_DIR = '/home/z/my-project/download/graficos_trading'

for ticker in ['nvda', 'tsla']:
    for tf in ['1d', '1h', '5m', '1m']:
        fname = f'{SAVE_DIR}/{ticker}_{tf}.csv'
        try:
            df = pd.read_csv(fname, header=[0,1], index_col=0, parse_dates=True)
            df.columns = ['Close','High','Low','Open','Volume']
            df.index.name = 'Date'
            df.to_csv(f'{SAVE_DIR}/{ticker}_{tf}_clean.csv')
            print(f'{ticker}_{tf}: {len(df)} rows, {df.index[0]} to {df.index[-1]}')
        except Exception as e:
            print(f'Error {ticker}_{tf}: {e}')

for tf in ['qqq', 'vix']:
    fname = f'{SAVE_DIR}/{tf}_1d.csv'
    try:
        df = pd.read_csv(fname, header=[0,1], index_col=0, parse_dates=True)
        df.columns = ['Close','High','Low','Open','Volume']
        df.index.name = 'Date'
        df.to_csv(f'{SAVE_DIR}/{tf}_1d_clean.csv')
        print(f'{tf}_1d: {len(df)} rows')
    except Exception as e:
        print(f'Error {tf}_1d: {e}')

