/**
 * 
 */
package com.schlaf.steam.activities.selectlist;

import java.util.EventListener;

import android.view.View;

import com.schlaf.steam.activities.selectlist.selection.SelectionEntry;

/**
 * @author S0085289
 *
 */
public interface ArmySelectionChangeListener extends EventListener {

	public void onModelAdded(SelectionEntry model);
	
	// public void onModelRemoved(SelectionEntry model);
	
	public void viewSelectionDetail(SelectionEntry model);

	public void notifyArmyChange();
	
	public void toSelectedArmy(View v);
	
	public void toSelectionArmy(View v);

}
