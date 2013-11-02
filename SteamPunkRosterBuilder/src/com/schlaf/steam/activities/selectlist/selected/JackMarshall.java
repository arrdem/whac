package com.schlaf.steam.activities.selectlist.selected;

/**
 * interface for any model with jackMarshall ability
 * @author S0085289
 *
 */
public interface JackMarshall extends JackCommander {

	/**
	 * return the max number of jacks that can be affected to this entry
	 * @return
	 */
	public int getMaxJacks();
}
