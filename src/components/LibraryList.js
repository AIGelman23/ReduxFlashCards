import React, {Component} from 'react';
import {FlatList} from 'react-native';
import {connect} from 'react-redux';
import ListItem from './ListItem';

class LibraryList extends Component {
  renderItem(library) {
    return <ListItem library={library} />;
  }

  render() {
    return (
      <FlatList
        style={styles.flatListStyle}
        data={this.props.libraries}
        renderItem={this.renderItem}
        keyExtractor={(library) => library.id.toString()}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {libraries: state.libraries};
};

const styles = {
  flatListStyle: {
    paddingTop: 15,
  },
};

export default connect(mapStateToProps)(LibraryList);
