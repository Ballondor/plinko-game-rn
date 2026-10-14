// iOS 27 SDK는 UIScene 생명주기를 채택하지 않은 앱을 실행 시점에 강제 종료한다.
// Expo 57 템플릿은 아직 AppDelegate에서 window를 직접 만들기 때문에,
// prebuild 시 Expo가 제공하는 ExpoAppSceneDelegate를 쓰도록 패치한다.
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

const SCENE_DELEGATE_CLASS = 'EXExpoAppSceneDelegate';

function withSceneManifest(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: SCENE_DELEGATE_CLASS,
          },
        ],
      },
    };
    return cfg;
  });
}

function withFactoryProviderAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== 'swift') {
      throw new Error('withSceneDelegate: Swift AppDelegate만 지원합니다.');
    }
    let src = cfg.modResults.contents;

    // 씬 델리게이트가 AppDelegate에서 React Native factory를 꺼내 쓸 수 있도록 프로토콜 채택
    if (!src.includes('ExpoReactNativeFactoryProvider')) {
      src = src.replace(
        /class AppDelegate: ExpoAppDelegate \{/,
        'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {',
      );
    }

    // window 생성과 startReactNative는 씬 델리게이트가 담당하므로 제거
    src = src.replace(
      /#if os\(iOS\) \|\| os\(tvOS\)\s*\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)[\s\S]*?#endif\n/,
      '',
    );

    if (!src.includes('ExpoReactNativeFactoryProvider') || src.includes('UIScreen.main.bounds')) {
      throw new Error('withSceneDelegate: AppDelegate 패치에 실패했습니다. 템플릿이 바뀌었는지 확인하세요.');
    }

    cfg.modResults.contents = src;
    return cfg;
  });
}

module.exports = function withSceneDelegate(config) {
  return withFactoryProviderAppDelegate(withSceneManifest(config));
};
