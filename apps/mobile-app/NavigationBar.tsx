import {Appbar} from "react-native-paper";
import {getHeaderTitle} from "@react-navigation/elements";
import {NativeStackHeaderProps} from "@react-navigation/native-stack";

export interface NavigationBarProps {
  props: NativeStackHeaderProps;
}

export default function NavigationBar(outerprops: NavigationBarProps) {
  const props = outerprops.props;
  const title = getHeaderTitle(props.options, props.route.name);

  return (
    <Appbar.Header>
      {props.back ? (
        <Appbar.BackAction onPress={props.navigation.goBack} />
      ) : null}
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}
