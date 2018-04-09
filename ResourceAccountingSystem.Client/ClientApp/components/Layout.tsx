import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

export class Layout extends React.Component<{}, {}> {
    public render() {
        return (
            <div>
                <MuiThemeProvider>
                    <div className='container-fluid' style={{ marginTop: 20 }}>
                            {this.props.children}
                    </div>
                </MuiThemeProvider>
            </div>
        )
    }
}
