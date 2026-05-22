import WidgetKit
import SwiftUI

@main
struct FokusWidgetBundle: WidgetBundle {
    @WidgetBundleBuilder
    var body: some Widget {
        FokusWidget()
        if #available(iOS 16.2, *) {
            FokusLiveActivity()
        }
    }
}
