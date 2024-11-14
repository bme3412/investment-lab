import os
import json
import pandas as pd
import numpy as np
import requests
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import plotly.graph_objects as go
from scipy.signal import savgol_filter
from sklearn.preprocessing import StandardScaler

class CustomJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle Pandas Timestamps"""
    def default(self, obj):
        if isinstance(obj, pd.Timestamp):
            return obj.isoformat()
        return super().default(obj)

class SemiCycleAnalyzer:
    def __init__(self, api_key: str):
        """Initialize the analyzer with API key and configuration"""
        self.api_key = api_key
        self.base_url = "https://financialmodelingprep.com/api/v3"
        
        # Historical cycles reference
        self.historical_cycles = {
            '1990s': {
                'boom': ('1993-01-01', '1995-12-31'),
                'bust': ('1996-01-01', '1998-12-31'),
                'notes': 'PC-driven cycle',
                'drivers': {
                    'boom': [
                        'Mass PC adoption',
                        'Windows 95 launch',
                        'Corporate PC refresh'
                    ],
                    'bust': [
                        'Manufacturing overcapacity',
                        'Asian financial crisis',
                        'Inventory correction'
                    ]
                }
            },
            'dotcom': {
                'boom': ('1999-01-01', '2000-12-31'),
                'bust': ('2001-01-01', '2002-12-31'),
                'notes': 'Internet bubble',
                'drivers': {
                    'boom': [
                        'Internet infrastructure buildout',
                        'Y2K spending surge',
                        'Telecom expansion'
                    ],
                    'bust': [
                        'Dot-com bubble burst',
                        'Telecom crash',
                        'Enterprise spending freeze'
                    ]
                }
            },
            '2006-2009': {
                'boom': ('2006-01-01', '2007-12-31'),
                'bust': ('2008-01-01', '2009-12-31'),
                'notes': 'Financial crisis',
                'drivers': {
                    'boom': [
                        'Mobile phone growth',
                        'Early smartphone era',
                        'Gaming console cycle'
                    ],
                    'bust': [
                        'Global financial crisis',
                        'Consumer spending drop',
                        'Credit market freeze'
                    ]
                }
            },
            '2016-2019': {
                'boom': ('2016-01-01', '2018-12-31'),
                'bust': ('2019-01-01', '2019-12-31'),
                'notes': 'Memory-led cycle',
                'drivers': {
                    'boom': [
                        'Data center expansion',
                        'Memory price increases',
                        'Crypto mining demand'
                    ],
                    'bust': [
                        'Memory oversupply',
                        'Trade tensions',
                        'Inventory correction'
                    ]
                }
            },
            '2020-2023': {
                'boom': ('2020-03-01', '2022-09-30'),
                'bust': ('2022-10-01', '2023-12-31'),
                'notes': 'Post-COVID super cycle',
                'drivers': {
                    'boom': [
                        'Work-from-home demand',
                        'Supply chain shortages',
                        'Cloud/AI expansion'
                    ],
                    'bust': [
                        'PC/smartphone slowdown',
                        'Inventory digestion',
                        'Consumer weakness'
                    ]
                }
            }
        }
        
        # Enhanced company categories with expanded coverage
        self.companies = {
            'equipment': {
                'tickers': [
                    'ASML',     # Lithography leader
                    'AMAT',     # Broad equipment portfolio
                    'LRCX',     # Etch leader
                    'KLAC',     # Inspection/metrology
                    'TER',      # Test equipment
                    'TOELY',    # Tokyo Electron
                    'ACLS',     # Axcelis Technologies
                    'CCMP',     # CMC Materials
                    'UCTT',     # Ultra Clean Holdings
                    'MKSI'      # MKS Instruments
                ],
                'weight': 0.3,
                'color': '#1f77b4',
                'cycle_sensitivity': 'very high',
                'notes': 'First to show cycle turns, high operating leverage'
            },
            'foundry': {
                'tickers': [
                    'TSM',      # TSMC
                    'UMC',      # United Microelectronics
                    'GWGRF',    # GlobalWafers
                    'SUMCF',    # Sumco Corp
                    'SIMO',     # Silicon Motion
                    'SILC',     # Silicon Labs
                    'VSH',      # Vishay
                    'OIIM'      # O2Micro International
                ],
                'weight': 0.25,
                'color': '#ff7f0e',
                'cycle_sensitivity': 'high',
                'notes': 'Capex driven, capacity indicates cycle'
            },
            'memory': {
                'tickers': [
                    'MU',       # Micron
                    'WDC',      # Western Digital
                    'STX',      # Seagate
                    'SSNLF',    # Samsung Electronics
                    'KIOXF',    # Kioxia
                    'NTDOF'     # Nanya Technology
                ],
                'weight': 0.25,
                'color': '#2ca02c',
                'cycle_sensitivity': 'very high',
                'notes': 'Most volatile, pricing sensitivity'
            },
            'logic': {
                'tickers': [
                    'NVDA',     # NVIDIA
                    'AMD',      # Advanced Micro Devices
                    'INTC',     # Intel
                    'QCOM',     # Qualcomm
                    'AVGO',     # Broadcom
                    'MRVL',     # Marvell
                    'ADI',      # Analog Devices
                    'TXN',      # Texas Instruments
                    'NXPI',     # NXP Semiconductors
                    'ON'        # ON Semiconductor
                ],
                'weight': 0.2,
                'color': '#d62728',
                'cycle_sensitivity': 'medium',
                'notes': 'More stable margins, end-market diversity'
            }
        }
        
        # Enhanced metrics with cycle relevance
        self.metrics = {
            'quarterly_revenue_growth': {
                'weight': 0.25,
                'description': 'QoQ revenue growth',
                'higher_is_better': True,
                'cycle_timing': 'leading',
                'typical_range': (-15, 25)
            },
            'gross_margin': {
                'weight': 0.25,
                'description': 'Gross profit margin',
                'higher_is_better': True,
                'cycle_timing': 'coincident',
                'typical_range': (30, 65)
            },
            'inventory_turnover': {
                'weight': 0.25,
                'description': 'Revenue/Inventory (annualized)',
                'higher_is_better': True,
                'cycle_timing': 'leading',
                'typical_range': (3, 8)
            },
            'operating_margin': {
                'weight': 0.25,
                'description': 'Operating profit margin',
                'higher_is_better': True,
                'cycle_timing': 'coincident',
                'typical_range': (15, 45)
            }
        }

    def _fetch_data(self, endpoint: str, ticker: str) -> List[Dict]:
        """Helper method to fetch data from Financial Modeling Prep API and save as JSON"""
        try:
            url = f"{self.base_url}{endpoint}&apikey={self.api_key}"
            response = requests.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Create ticker-specific directory
                    ticker_dir = f'data/{ticker}'
                    if not os.path.exists(ticker_dir):
                        os.makedirs(ticker_dir)
                    
                    # Save the data as JSON in ticker's directory
                    endpoint_type = endpoint.split('/')[1].split('?')[0]
                    filename = f"{ticker_dir}/{endpoint_type}.json"
                    with open(filename, 'w') as f:
                        json.dump(data, f, indent=2)
                    return data
                else:
                    print(f"Unexpected response format from API: {data}")
                    return []
            else:
                print(f"API call failed with status code: {response.status_code}")
                if response.status_code == 429:
                    print("Rate limit exceeded. Please wait before making more requests.")
                elif response.status_code == 403:
                    print("API key invalid or expired.")
                print(f"Error response: {response.text}")
                return []
                
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    def fetch_financial_data(self, ticker: str) -> pd.DataFrame:
        """Fetch and process financial statements for a company"""
        print(f"\nFetching data for {ticker}...")
        try:
            # Fetch quarterly statements
            income_stmt = self._fetch_data(f'/income-statement/{ticker}?period=quarter&limit=60', ticker)
            balance_sheet = self._fetch_data(f'/balance-sheet-statement/{ticker}?period=quarter&limit=60', ticker)
            
            if not income_stmt or not balance_sheet:
                print(f"No data available for {ticker}")
                return pd.DataFrame()

            # Process income statement
            df_income = pd.DataFrame(income_stmt)
            df_balance = pd.DataFrame(balance_sheet)
            
            # Convert dates and sort
            for df in [df_income, df_balance]:
                df['date'] = pd.to_datetime(df['date'])
                df.sort_values('date', inplace=True)
            
            # Merge statements
            df = pd.merge_asof(
                df_income[['date', 'revenue', 'grossProfit', 'operatingIncome']],
                df_balance[['date', 'inventory']],
                on='date',
                direction='backward'
            )
            
            # Calculate metrics
            df['quarterly_revenue_growth'] = df['revenue'].pct_change() * 100
            df['gross_margin'] = (df['grossProfit'] / df['revenue']) * 100
            df['operating_margin'] = (df['operatingIncome'] / df['revenue']) * 100
            df['inventory_turnover'] = np.where(
                df['inventory'] > 0,
                (df['revenue'] * 4) / df['inventory'],  # Annualized
                np.nan
            )
            
            # Add TTM metrics
            df['ttm_revenue'] = df['revenue'].rolling(4).sum()
            df['ttm_revenue_growth'] = df['ttm_revenue'].pct_change(4) * 100
            
            return df
            
        except Exception as e:
            print(f"Error processing {ticker}: {e}")
            return pd.DataFrame()

    def _process_company_data(self, data: pd.DataFrame, ticker: str) -> Tuple[pd.Series, Dict]:
        """Process company metrics into composite score"""
        if data.empty:
            return pd.Series(dtype=float), {}

        metric_scores = pd.DataFrame(index=data['date'])
        metric_stats = {}
        
        for metric, info in self.metrics.items():
            if metric not in data.columns:
                continue
            
            raw_data = data.set_index('date')[metric].copy()
            
            # Remove outliers
            low, high = info['typical_range']
            raw_data_clipped = raw_data.clip(low, high)
            
            # Standardize scores
            scaler = StandardScaler()
            score = pd.Series(
                scaler.fit_transform(raw_data_clipped.values.reshape(-1, 1)).flatten(),
                index=raw_data_clipped.index
            )
            
            # Adjust direction and weight
            if not info['higher_is_better']:
                score = -score
            weighted_score = score * info['weight']
            metric_scores[metric] = weighted_score
            
            # Store statistics
            metric_stats[metric] = {
                'current': raw_data.iloc[-1] if len(raw_data) > 0 else None,
                'mean': raw_data.mean(),
                'std': raw_data.std(),
                'min': raw_data.min(),
                'max': raw_data.max()
            }

        if metric_scores.empty:
            return pd.Series(dtype=float), {}

        # Combine scores
        combined_score = metric_scores.sum(axis=1)
        
        # Smooth the score using Savitzky-Golay filter
        if len(combined_score) > 5:
            window = min(5, len(combined_score) - 1)
            if window % 2 == 0:
                window = max(3, window - 1)
            smoothed_score = pd.Series(
                savgol_filter(combined_score, window, 3),
                index=combined_score.index
            )
        else:
            smoothed_score = combined_score
        
        return smoothed_score, metric_stats

    def build_cycle_indicator(self) -> Tuple[pd.DataFrame, Dict]:
        """Build composite cycle indicator"""
        all_scores = {}
        category_stats = {}
        
        for category, info in self.companies.items():
            category_scores = {}
            category_metrics = {}
            
            for ticker in info['tickers']:
                data = self.fetch_financial_data(ticker)
                if not data.empty:
                    score, metrics = self._process_company_data(data, ticker)
                    if not score.empty:
                        category_scores[ticker] = score
                        category_metrics[ticker] = metrics
            
            if category_scores:
                # Calculate category indicator
                category_df = pd.DataFrame(category_scores)
                category_mean = category_df.mean(axis=1)
                all_scores[f'{category}_indicator'] = category_mean * info['weight']
                
                # Store category stats
                category_stats[category] = {
                    'metrics': category_metrics,
                    'weight': info['weight'],
                    'color': info['color'],
                    'sensitivity': info['cycle_sensitivity']
                }
        
        if all_scores:
            # Build composite indicator
            composite = pd.DataFrame(all_scores)
            composite.index = pd.DatetimeIndex(composite.index)
            composite = composite.sort_index()
            
            # Calculate derived indicators
            composite['composite_score'] = composite.sum(axis=1)
            composite['momentum'] = composite['composite_score'].diff()
            composite['acceleration'] = composite['momentum'].diff()
            
            # Determine cycle phase
            composite['cycle_phase'] = pd.cut(
                composite['composite_score'],
                bins=4,
                labels=['Downturn', 'Early Recovery', 'Expansion', 'Peak']
            )
            
            return composite, category_stats
        
        return pd.DataFrame(), {}
    def add_cycle_annotations(self, fig: go.Figure, start_date: pd.Timestamp) -> None:
        """Add detailed cycle annotations to the visualization"""
        # Only show cycles from 2007 onwards
        relevant_cycles = {k: v for k, v in self.historical_cycles.items() 
                         if pd.Timestamp(v['bust'][1]) >= start_date}
        
        for period, cycle in relevant_cycles.items():
            boom_start = pd.to_datetime(cycle['boom'][0])
            boom_end = pd.to_datetime(cycle['boom'][1])
            bust_start = pd.to_datetime(cycle['bust'][0])
            bust_end = pd.to_datetime(cycle['bust'][1])
            
            # Add boom period rectangle if it overlaps with our date range
            if boom_end >= start_date:
                actual_start = max(boom_start, start_date)
                fig.add_vrect(
                    x0=actual_start,
                    x1=boom_end,
                    fillcolor="rgba(0,255,0,0.1)",
                    layer="below",
                    line_width=0,
                    name=f"{period} Boom"
                )
                
                # Add boom annotation
                fig.add_annotation(
                    x=actual_start + (boom_end - actual_start) / 2,
                    y=1,
                    yref="paper",
                    text=f"<b>{period} Boom</b><br>{cycle['notes']}",
                    showarrow=False,
                    font=dict(size=10, color="green"),
                    bgcolor="rgba(255,255,255,0.8)",
                    bordercolor="green",
                    borderwidth=1,
                    borderpad=4
                )
            
            # Add bust period rectangle if it overlaps with our date range
            if bust_end >= start_date:
                actual_start = max(bust_start, start_date)
                fig.add_vrect(
                    x0=actual_start,
                    x1=bust_end,
                    fillcolor="rgba(255,0,0,0.1)",
                    layer="below",
                    line_width=0,
                    name=f"{period} Bust"
                )
                
                # Add bust annotation
                fig.add_annotation(
                    x=actual_start + (bust_end - actual_start) / 2,
                    y=0.9,
                    yref="paper",
                    text=f"<b>{period} Bust</b><br>{cycle['notes']}",
                    showarrow=False,
                    font=dict(size=10, color="red"),
                    bgcolor="rgba(255,255,255,0.8)",
                    bordercolor="red",
                    borderwidth=1,
                    borderpad=4
                )

    def visualize_cycle(self, composite_data: pd.DataFrame) -> None:
        """Create enhanced interactive visualization starting from 2007"""
        if composite_data.empty:
            print("No data available for visualization")
            return
            
        # Filter data to start from 2007
        start_date = pd.Timestamp('2007-01-01')
        composite_data = composite_data[composite_data.index >= start_date].copy()
        
        if composite_data.empty:
            print("No data available after 2007")
            return
            
        fig = go.Figure()

        # Plot composite score
        fig.add_trace(
            go.Scatter(
                x=composite_data.index,
                y=composite_data['composite_score'],
                name='Composite Score',
                line=dict(color='rgb(31, 119, 180)', width=3),
                mode='lines',
                hovertemplate='<b>%{x|%Y-%m-%d}</b><br>' +
                             'Score: %{y:.2f}<br>' +
                             'Phase: %{customdata}<extra></extra>',
                customdata=composite_data['cycle_phase']
            )
        )

        # Add confidence bands
        z_score = 1.96
        rolling_std = composite_data['composite_score'].rolling(window=12, min_periods=1).std()
        rolling_mean = composite_data['composite_score'].rolling(window=12, min_periods=1).mean()
        upper_bound = rolling_mean + (z_score * rolling_std)
        lower_bound = rolling_mean - (z_score * rolling_std)

        fig.add_trace(
            go.Scatter(
                x=composite_data.index,
                y=upper_bound,
                fill=None,
                mode='lines',
                line=dict(color='rgba(31, 119, 180, 0.1)', width=1),
                name='Volatility Band',  # Changed from 95% Confidence Interval
                showlegend=False
            )
        )

        fig.add_trace(
            go.Scatter(
                x=composite_data.index,
                y=lower_bound,
                fill='tonexty',
                mode='lines',
                line=dict(color='rgba(31, 119, 180, 0.1)', width=1),
                name='Volatility Band',  # Changed from 95% Confidence Interval
                fillcolor='rgba(31, 119, 180, 0.2)'
            )
        )

        # Add cycle annotations with the start date
        self.add_cycle_annotations(fig, start_date)

        # Current status indicators
        current_phase = str(composite_data['cycle_phase'].iloc[-1]) if not composite_data['cycle_phase'].empty else "Unknown"
        current_momentum = float(composite_data['momentum'].iloc[-1]) if not composite_data['momentum'].empty else 0
        current_acceleration = float(composite_data['acceleration'].iloc[-1]) if not composite_data['acceleration'].empty else 0

        momentum_direction = "increasing" if current_momentum > 0 else "decreasing"
        status_text = (
            f'Current Phase: {current_phase} | '
            f'Momentum: {momentum_direction} ({current_momentum:.2f}) | '
            f'Acceleration: {current_acceleration:.2f}'
        )

        # Methodology explanation
        methodology_text = """
        <b>About This Analysis:</b><br>
        This visualization tracks semiconductor industry cycles using a composite score derived from key metrics:
        <br>
        • Revenue Growth (25%): Quarter-over-quarter growth shows immediate trends<br>
        • Gross Margins (25%): Indicates pricing power and demand strength<br>
        • Inventory Turnover (25%): Early warning signal for supply/demand balance<br>
        • Operating Margins (25%): Shows overall industry health<br>
        <br>
        <b>How to Read:</b><br>
        • Higher Score = Industry Strength: Above 0 indicates above-average conditions<br>
        • Shaded Bands: Show typical range of score variation<br>
        • Green/Red Zones: Historical boom/bust periods<br>
        • Phase Labels: Current position in cycle (Downturn → Recovery → Expansion → Peak)
        """

        # Update layout with methodology
        fig.update_layout(
            height=1000,  # Increased height to accommodate methodology
            title={
                'text': f'Semiconductor Industry Cycle Analysis (2007-Present)<br>' +
                       f'<sup>{status_text}</sup>',
                'y': 0.98,
                'x': 0.5,
                'xanchor': 'center',
                'yanchor': 'top',
                'font': dict(size=20)
            },
            showlegend=True,
            legend=dict(
                yanchor="top",
                y=0.9,
                xanchor="left",
                x=0.01,
                bgcolor='rgba(255, 255, 255, 0.8)'
            ),
            hovermode='x unified',
            template='plotly_white',
            margin=dict(l=50, r=50, t=150, b=50),
            xaxis=dict(
                title="Date",
                showgrid=True,
                gridwidth=1,
                gridcolor='rgba(128, 128, 128, 0.2)',
                tickformat='%Y-%m',
                range=[start_date, composite_data.index.max()],
                dtick="M12"
            ),
            yaxis=dict(
                title=dict(
                    text="Industry Strength Score",  # Changed from Composite Score
                    font=dict(size=14)
                ),
                showgrid=True,
                gridwidth=1,
                gridcolor='rgba(128, 128, 128, 0.2)',
                zeroline=True,
                zerolinewidth=2,
                zerolinecolor='rgba(128, 128, 128, 0.5)'
            ),
            # Add methodology annotation
            annotations=[
                dict(
                    text=methodology_text,
                    x=1.2,  # Position to the right of the plot
                    y=0.5,
                    xref='paper',
                    yref='paper',
                    xanchor='left',
                    yanchor='middle',
                    showarrow=False,
                    bgcolor='rgba(255, 255, 255, 0.8)',
                    bordercolor='rgba(128, 128, 128, 0.5)',
                    borderwidth=1,
                    font=dict(size=12),
                    align='left'
                )
            ]
        )

        # Save visualization
        if not os.path.exists('data/visualizations'):
            os.makedirs('data/visualizations')
            
        fig.write_html(
            'data/visualizations/semi_cycle_visualization.html',
            include_plotlyjs='cdn',
            full_html=True,
            config={
                'responsive': True,
                'displayModeBar': True,
                'modeBarButtonsToAdd': ['drawline', 'drawopenpath', 'eraseshape'],
                'displaylogo': False
            }
        )

        print("\nVisualization saved in 'data/visualizations/semi_cycle_visualization.html'")

    def _save_enhanced_data(self, composite_data: pd.DataFrame) -> None:
        """Save data in an enhanced structure with better organization"""
        if not os.path.exists('data/composite'):
            os.makedirs('data/composite')
            
        # Create a more comprehensive data structure
        output_data = {
            'metadata': {
                'last_updated': datetime.now().isoformat(),
                'data_points': len(composite_data),
                'date_range': {
                    'start': composite_data.index.min().isoformat(),
                    'end': composite_data.index.max().isoformat()
                }
            },
            'current_status': {
                'phase': str(composite_data['cycle_phase'].iloc[-1]),
                'composite_score': float(composite_data['composite_score'].iloc[-1]),
                'momentum': float(composite_data['momentum'].iloc[-1]),
                'acceleration': float(composite_data['acceleration'].iloc[-1])
            },
            'historical_data': json.loads(composite_data.reset_index().to_json(orient='records', date_format='iso')),
            'summary_statistics': {
                'composite_score': {
                    'mean': float(composite_data['composite_score'].mean()),
                    'std': float(composite_data['composite_score'].std()),
                    'min': float(composite_data['composite_score'].min()),
                    'max': float(composite_data['composite_score'].max())
                }
            }
        }
        
        # Save as JSON with proper formatting using CustomJSONEncoder
        with open('data/composite/semi_cycle_data.json', 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False, cls=CustomJSONEncoder)
        
        # Save as CSV in composite directory
        composite_data.to_csv('data/composite/semi_cycle_data.csv')
        print("\nData saved successfully in 'data/composite' directory")
        print("Visualization saved in 'data/visualizations' directory")

    @staticmethod
    def _get_phase_color(phase: str) -> str:
        """Return color for cycle phase"""
        colors = {
            'Downturn': 'rgba(255, 0, 0, 0.1)',
            'Early Recovery': 'rgba(255, 165, 0, 0.1)',
            'Expansion': 'rgba(0, 255, 0, 0.1)',
            'Peak': 'rgba(255, 255, 0, 0.1)'
        }
        return colors.get(phase, 'rgba(128, 128, 128, 0.1)')

def main():
    """Main function to run the semiconductor cycle analysis"""
    
    # Initialize with your API key
    api_key = "c4ad87b03bec1878bc0be6156d4472b0"  # Replace with actual API key
    
    try:
        # Create analyzer instance
        print("Initializing Semiconductor Cycle Analyzer...")
        analyzer = SemiCycleAnalyzer(api_key)
        
        # Test API connection
        print("\nTesting API connection...")
        test_data = analyzer._fetch_data('/income-statement/AAPL?period=quarter&limit=1', 'AAPL')
        if not test_data:
            print("Error: API connection failed. Please check your API key and internet connection.")
            return
        
        print("API connection successful. Fetching data...")
        
        # Build cycle indicator
        composite_data, category_stats = analyzer.build_cycle_indicator()
        
        if not composite_data.empty:
            print("\nData processing complete. Generating visualization...")
            analyzer.visualize_cycle(composite_data)
        else:
            print("\nError: No data available for visualization")
            
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        raise

if __name__ == "__main__":
    main()